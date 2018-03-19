// Express requirements
import path from 'path';
import fs from 'fs';

// React requirements
import React from 'react';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import { replace } from 'react-router-redux';
import { Frontload, frontloadServerRender } from 'react-frontload';
import Loadable from 'react-loadable';

// Our store, entrypoint, and manifest
import store from '../src/store';
import App from '../src/containers/app';
import { setApiUrl } from '../src/modules/blog';
import manifest from '../build/asset-manifest.json';

export default (req, res) => {
  // A simple helper function to prepare the HTML markup
  const injectHTML = (data, { html, title, meta, body, scripts, state }) => {
    // Load the HTML tag
    data = data.replace('<html>', `<html ${html}>`);

    // Load the title
    data = data.replace(/<title>.*?<\/title>/g, title);

    // Load other metadata (for SEO and such)
    data = data.replace('</head>', `${meta}</head>`);

    // Preload the state and HTML
    data = data.replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div><script>window.__PRELOADED_STATE__ = ${state}</script>`
    );

    // Load in the required code split resources
    data = data.replace('</body>', scripts.join('') + '</body>');

    return data;
  };

  // Load in our HTML file from our build
  fs.readFile(
    path.resolve(__dirname, '../build/index.html'),
    'utf8',
    (err, htmlData) => {
      // If there's an error... serve up something nasty
      if (err) {
        console.error('Read error', err);

        return res.status(404).end();
      }

      // Push the current url into the store to let Redux know what state to load
      store.dispatch(replace(req.url));

      // When CRA builds it always builds to the production environment
      // However, our express server has a separate NODE_ENV variable as defined in package.json
      // In short...
      // yarn start === localhost
      // yarn build && yarn serve === localhost
      // yarn build && yarn deploy === live API
      if (process.env.NODE_ENV === 'production') {
        store.dispatch(setApiUrl('https://api.openmined.org/wp-json'));
      }

      const context = {};
      const modules = [];

      // Render App in React, passing it through Frontload first
      frontloadServerRender(() =>
        renderToString(
          <Loadable.Capture report={m => modules.push(m)}>
            <Provider store={store}>
              <StaticRouter location={req.url} context={context}>
                <Frontload isServer>
                  <App />
                </Frontload>
              </StaticRouter>
            </Provider>
          </Loadable.Capture>
        )
      ).then(routeMarkup => {
        if (context.url) {
          // If we need to handle a redirect...
          res
            .writeHead(302, {
              Location: context.url
            })
            .end();
        } else {
          // Otherwise, we carry on...
          const extractAssets = (assets, chunks) =>
            Object.keys(assets)
              .filter(asset => chunks.indexOf(asset.replace('.js', '')) > -1)
              .map(k => assets[k]);

          const extraChunks = extractAssets(manifest, modules).map(
            c => `<script type="text/javascript" src="/${c}"></script>`
          );

          // Let Helmet know to insert the right tags
          const helmet = Helmet.renderStatic();

          console.log('THE TITLE', helmet.title.toString());
          // console.log('THE MODULES', extraChunks);
          // console.log('THE MARKUP', routeMarkup);

          // Form the final HTML response
          const html = injectHTML(htmlData, {
            html: helmet.htmlAttributes.toString(),
            title: helmet.title.toString(),
            meta: helmet.meta.toString(),
            body: routeMarkup,
            scripts: extraChunks,
            state: JSON.stringify(store.getState()).replace(/</g, '\\u003c')
          });

          // Up, up, and away...
          res.send(html);
        }
      });
    }
  );
};
