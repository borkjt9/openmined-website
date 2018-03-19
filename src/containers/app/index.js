import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import Loadable from 'react-loadable';

// Action Creators
import { removeNotification } from '../../modules/notifications';

// UI Components
import Notifications from './components/notifications';

// Routes via react-loadable code splitting
const Homepage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "homepage" */ './routes/static/homepage'),
  loading: () => null,
  modules: ['homepage']
});

const Blog = Loadable({
  loader: () => import(/* webpackChunkName: "blog" */ './routes/static/blog'),
  loading: () => null,
  modules: ['blog']
});

const BlogPost = Loadable({
  loader: () =>
    import(/* webpackChunkName: "blog-post" */ './routes/static/blog-post'),
  loading: () => null,
  modules: ['blog-post']
});

const NotFound = Loadable({
  loader: () =>
    import(/* webpackChunkName: "not-found" */ './routes/not-found'),
  loading: () => null,
  modules: ['not-found']
});

const RedirectToWordpress = () =>
  (window.location = 'https://api.openmined.org/wp-login.php');

class App extends Component {
  render() {
    return (
      <div id="app">
        <Notifications
          notifications={this.props.notifications}
          removeFunc={this.props.removeNotification}
        />
        <div id="content">
          <Switch>
            <Route exact path="/" component={Homepage} />

            <Route path="/blog/:taxonomy/:slug/" component={Blog} />
            <Route path="/blog/:slug/" component={BlogPost} />
            <Route path="/blog" component={Blog} />

            <Route path="/admin" component={RedirectToWordpress} />

            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  notifications: state.notifications.notifications
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ removeNotification }, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
