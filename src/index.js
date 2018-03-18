import React from 'react';
import { render, hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import { Frontload } from 'react-frontload';
import { ConnectedRouter } from 'react-router-redux';
import store, { history } from './store';
import { unregister } from './registerServiceWorker';

import App from './containers/app';

import './index.css';

const Application = (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Frontload noServerRender>
        <App />
      </Frontload>
    </ConnectedRouter>
  </Provider>
);

const root = document.querySelector('#root');

// Render everything to the root - it's business time
if (process.env.NODE_ENV === 'production') {
  window.onload = () => {
    Loadable.preloadReady().then(() => {
      hydrate(Application, root);
    });
  };
} else {
  render(Application, root);
}

// TODO: Until we can find a way to perform SSR with a service worker - let's get this outta here
// registerServiceWorker();
unregister();
