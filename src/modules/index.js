import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
import notifications, { addNotification } from './notifications';
import homepage from './homepage';
import blog from './blog';

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
