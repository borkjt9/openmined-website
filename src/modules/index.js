import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
import notifications, { addNotification } from './notifications';
import homepage from './homepage';
import blog from './blog';

export const SITE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://www.openmined.org';

export const WORDPRESS_URL =
  process.env.NODE_ENV === 'development'
    ? 'https://openmined-wordpress.local'
    : 'https://api.openmined.org';

export const WORDPRESS_API_URL = WORDPRESS_URL + '/wp-json';

export const handleWordpressError = error =>
  addNotification({
    text: error,
    type: 'error'
  });

export default combineReducers({
  routing: routerReducer,
  auth,
  notifications,
  homepage,
  blog
});
