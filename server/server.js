/*
  TODO:
  - Fix issues with SSR fetch
  - Look into issues with images
    - Potentially move them into a forward directory rather than a backwards directory
    - If all else fails, move them to the public directory and call it a day
  - Fix FOUC
*/

// Silly global things
import 'ignore-styles';

// Express requirements
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import forceDomain from 'forcedomain';
import Loadable from 'react-loadable';

// Loader
import loader from './loader';

// Create our express app (using the port optionally specified)
const app = express();
const PORT = process.env.PORT || 3000;

// Forcing www and https redirects in production
if (process.env.HOST_NAME) {
  express.use(
    forceDomain({
      hostname: process.env.HOST_NAME,
      protocol: process.env.FORCE_SSL === 'true' ? 'https' : 'http'
    })
  );
}

// Compress, parse, and log
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Set up homepage, static assets, and capture everything else
app.use(express.Router().get('/', loader));
app.use(express.static(path.resolve(__dirname, '../build')));
app.use(loader);

// Let's rock
Loadable.preloadAll().then(() => {
  app.listen(PORT, console.log(`App listening on port ${PORT}!`));
});

// Handle the bugs somehow
app.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
