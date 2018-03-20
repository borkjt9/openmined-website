import { handleWordpressError } from './index';

export const CHANGE_API_URL = 'blog/CHANGE_API_URL';
export const GET_POSTS = 'blog/GET_POSTS';
export const GET_ALL_OF_TAXONOMY = 'blog/GET_ALL_OF_TAXONOMY';
export const NO_MORE_POSTS = 'blog/NO_MORE_POSTS';
export const GET_CURRENT_POST = 'blog/GET_CURRENT_POST';
export const GET_CURRENT_FEATURED_MEDIA = 'blog/GET_CURRENT_FEATURED_MEDIA';
export const GET_CURRENT_AUTHOR = 'blog/GET_CURRENT_AUTHOR';

const initialState = {
  apiUrl: 'https://openmined-wordpress.local/wp-json',
  posts: [],
  categories: [],
  tags: [],
  currentPost: {},
  currentFeaturedMedia: {},
  currentAuthor: {},
  postsLoaded: false,
  categoriesLoaded: false,
  tagsLoaded: false,
  currentPostLoaded: false,
  currentFeaturedMediaLoaded: false,
  currentAuthorLoaded: false,
  outOfPosts: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_API_URL:
      return {
        ...state,
        apiUrl: action.route
      };

    case GET_POSTS:
      if (action.isFresh) {
        return {
          ...state,
          posts: action.posts,
          postsLoaded: true,
          outOfPosts: false
        };
      } else {
        return {
          ...state,
          posts: state.posts.concat(action.posts),
          postsLoaded: true
        };
      }

    case NO_MORE_POSTS:
      return {
        ...state,
        outOfPosts: true
      };

    case GET_ALL_OF_TAXONOMY:
      return {
        ...state,
        [action.taxonomy]: action.data,
        [action.taxonomy + 'Loaded']: true
      };

    case GET_CURRENT_POST:
      return {
        ...state,
        currentPost: action.post,
        currentPostLoaded: true
      };

    case GET_CURRENT_FEATURED_MEDIA:
      return {
        ...state,
        currentFeaturedMedia: action.media,
        currentFeaturedMediaLoaded: true
      };

    case GET_CURRENT_AUTHOR:
      return {
        ...state,
        currentAuthor: action.author,
        currentAuthorLoaded: true
      };

    default:
      return state;
  }
};

export const setApiUrl = route => dispatch =>
  new Promise(resolve => {
    dispatch({
      type: CHANGE_API_URL,
      route
    });

    resolve(route);
  });

const getOrLoadTaxonomies = API_URL => (dispatch, getState) =>
  new Promise(resolve => {
    let { categoriesLoaded, tagsLoaded } = getState().blog;

    if (categoriesLoaded && tagsLoaded) {
      resolve({
        categories: getState().blog.categories,
        tags: getState().blog.tags
      });
    } else {
      const getTaxonomy = taxonomy => {
        return fetch(API_URL + '/wp/v2/' + taxonomy + '/?per_page=100')
          .then(response => response.json())
          .catch(error => dispatch(handleWordpressError(error)));
      };

      Promise.all([getTaxonomy('categories'), getTaxonomy('tags')]).then(
        response => {
          let categories = response[0];
          let tags = response[1];

          if (categories && tags) {
            dispatch({
              type: GET_ALL_OF_TAXONOMY,
              taxonomy: 'categories',
              data: categories
            });

            dispatch({
              type: GET_ALL_OF_TAXONOMY,
              taxonomy: 'tags',
              data: tags
            });

            resolve({ categories, tags });
          }
        }
      );
    }
  });

const getAllPosts = (
  API_URL,
  query,
  isFresh,
  { categories, tags }
) => dispatch =>
  new Promise(resolve => {
    const matchTaxonomyWithId = (list, slug) => {
      let returned = {};

      list.forEach(taxonomy => {
        if (taxonomy.slug === slug) {
          returned = taxonomy;
        }
      });

      return returned;
    };

    if (query.categories) {
      query.categories = matchTaxonomyWithId(categories, query.categories).id;
    }

    if (query.tags) {
      query.tags = matchTaxonomyWithId(tags, query.tags).id;
    }

    if (query.digs) {
      query.categories = query.digsId;

      delete query.digs;
      delete query.digsId;
    } else {
      query.categories_exclude = query.digsId;
    }

    let queryString = Object.keys(query)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
      .join('&');

    fetch(API_URL + '/wp/v2/posts?' + queryString + '&_envelope')
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: GET_POSTS,
          posts: response.body,
          isFresh
        });

        if (response.headers['X-WP-TotalPages'] === query.page) {
          dispatch({
            type: NO_MORE_POSTS
          });
        }

        resolve(response.body);
      })
      .catch(error => dispatch(handleWordpressError(error)));
  });

const getPost = (API_URL, slug) => dispatch =>
  new Promise(resolve => {
    fetch(API_URL + '/wp/v2/posts/?slug=' + slug)
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: GET_CURRENT_POST,
          post: response[0]
        });

        resolve(response[0]);
      })
      .catch(error => dispatch(handleWordpressError(error)));
  });

const getFeaturedMedia = (API_URL, id) => dispatch =>
  new Promise(resolve => {
    fetch(API_URL + '/wp/v2/media/' + id)
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: GET_CURRENT_FEATURED_MEDIA,
          media: response
        });

        resolve(response);
      })
      .catch(error => dispatch(handleWordpressError(error)));
  });

const getAuthor = (API_URL, id) => dispatch =>
  new Promise(resolve => {
    fetch(API_URL + '/wp/v2/users/' + id)
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: GET_CURRENT_AUTHOR,
          author: response
        });

        resolve(response);
      })
      .catch(error => dispatch(handleWordpressError(error)));
  });

export const getPosts = (query, isFresh) => async (dispatch, getState) => {
  const API_URL = getState().blog.apiUrl;

  const taxonomies = await dispatch(getOrLoadTaxonomies(API_URL));

  taxonomies.categories.forEach(category => {
    if (category.slug === 'digs') {
      query.digsId = category.id;
    }
  });

  await dispatch(getAllPosts(API_URL, query, isFresh, taxonomies));
};

export const getCurrentPost = slug => async (dispatch, getState) => {
  const API_URL = getState().blog.apiUrl;

  await dispatch(getOrLoadTaxonomies(API_URL));

  const post = await dispatch(getPost(API_URL, slug));

  await dispatch(getFeaturedMedia(API_URL, post.featured_media));
  await dispatch(getAuthor(API_URL, post.author));
};
