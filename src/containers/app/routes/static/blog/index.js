import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Container, Row, Column, Button, Page } from 'openmined-ui';
import { connect } from 'react-redux';
import { frontloadConnect } from 'react-frontload';
import { Link } from 'react-router-dom';
import { getPosts } from '../../../../../modules/blog';
import { getContent } from '../../../../../modules/homepage';
import { SITE_URL } from '../../../../../modules';

import BlogHeader from '../../../components/blog-header';
import Loading from '../../../components/loading';
import BlogPosts from '../../../components/blog-posts';
import FooterLinks from '../../../components/footer-links';

import './blog.css';

const blogTitle = 'OpenMined Blog';
const blogShortName = 'Blog';
const blogExcerpt =
  'Home to the latest research, thoughts, and demos surrounding the OpenMined project and the larger artificial intelligence ecosystem.';

// TODO: Newsletter link...

const frontload = props => {
  const request = { page: 1 };
  const { taxonomy, slug, locale } = props.match.params;

  if (locale === 'digs') {
    request.digs = true;
  }

  if (taxonomy && slug) {
    request[taxonomy] = slug;
  }

  return props.getPosts(request, true);
};

class Blog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };

    this.loadPosts = this.loadPosts.bind(this);
    this.loadMorePosts = this.loadMorePosts.bind(this);
    this.blogHeaderInfo = this.blogHeaderInfo.bind(this);
  }

  componentDidMount() {
    this.props.getContent(false);
  }

  componentWillReceiveProps(newProps) {
    const newUrl = newProps.match.params;
    const oldUrl = this.props.match.params;

    if (
      newUrl.taxonomy !== oldUrl.taxonomy ||
      newUrl.slug !== oldUrl.slug ||
      newUrl.locale !== oldUrl.locale
    ) {
      this.setState(
        {
          page: 1
        },
        () => {
          this.loadPosts(this.state.page, true);
        }
      );
    }
  }

  loadPosts(page = 1, isFresh = false) {
    const hasTaxonomy = this.props.match.params.hasOwnProperty('taxonomy');

    if (hasTaxonomy) {
      let { taxonomy, slug, locale } = this.props.match.params;

      this.props.getPosts(
        {
          page: this.state.page,
          [taxonomy]: slug,
          digs: locale === 'digs'
        },
        isFresh
      );
    } else if (!hasTaxonomy) {
      let { locale } = this.props.match.params;

      this.props.getPosts(
        {
          page: this.state.page,
          digs: locale === 'digs'
        },
        isFresh
      );
    }
  }

  loadMorePosts() {
    let newPage = this.state.page + 1;

    this.setState(
      {
        page: newPage
      },
      () => {
        this.loadPosts(newPage, false);
      }
    );
  }

  lookupTaxonomy(list, check, field = 'slug') {
    let returned = {};

    list.forEach(taxonomy => {
      if (taxonomy[field] === check) {
        returned = taxonomy;
      }
    });

    return returned;
  }

  seoHeaderInfo(taxonomy, slug, shortName, excerpt, images) {
    if (taxonomy && slug) {
      let taxonomyData =
        taxonomy === 'categories'
          ? this.lookupTaxonomy(this.props.categories, slug)
          : this.lookupTaxonomy(this.props.tags, slug);

      return {
        title: shortName + ' - ' + taxonomyData.name,
        description: taxonomyData.description || excerpt,
        ...images
      };
    } else {
      return {
        title: shortName,
        description: excerpt,
        ...images
      };
    }
  }

  blogHeaderInfo(taxonomy, slug, title, excerpt) {
    let links = this.props.content.footer.links;

    if (taxonomy && slug) {
      let taxonomyData =
        taxonomy === 'categories'
          ? this.lookupTaxonomy(this.props.categories, slug)
          : this.lookupTaxonomy(this.props.tags, slug);

      return {
        title: taxonomyData.name,
        excerpt: taxonomyData.description || null,
        links
      };
    } else {
      return {
        title,
        excerpt,
        links
      };
    }
  }

  generateMetadata(locale, categories) {
    let title, shortName, excerpt;

    if (locale === 'digs') {
      let digsData = this.lookupTaxonomy(categories, locale);

      title = digsData.name;
      shortName = title;
      excerpt = digsData.description;
    } else {
      title = blogTitle;
      shortName = blogShortName;
      excerpt = blogExcerpt;
    }

    return {
      title,
      shortName,
      excerpt,
      images: {
        image: `${SITE_URL}/images/logo-${locale}.png`,
        facebookImage: `${SITE_URL}/images/logo-${locale}-facebook.png`,
        twitterImage: `${SITE_URL}/images/logo-${locale}-twitter.png`
      }
    };
  }

  render() {
    const {
      posts,
      categories,
      tags,
      homepageLoaded,
      postsReady,
      outOfPosts,
      content
    } = this.props;

    const { taxonomy, slug, locale } = this.props.match.params;

    const { title, shortName, excerpt, images } = this.generateMetadata(
      locale,
      categories
    );

    return (
      <Page
        id="blog"
        {...this.seoHeaderInfo(taxonomy, slug, shortName, excerpt, images)}
      >
        <Loading shouldHideWhen={homepageLoaded && postsReady} />
        {postsReady && (
          <div id="posts-content">
            <BlogHeader
              {...this.blogHeaderInfo(taxonomy, slug, title, excerpt)}
            />
            {locale === 'digs' &&
              homepageLoaded && (
                <Container>
                  <Row>
                    <Column sizes={{ small: 12 }}>
                      <ul id="digs-filter">
                        <li className="digs-filter-description">
                          Sort by a topic:
                        </li>
                        {content.weekly_digs.digs_tags.map(tag => {
                          tag = this.lookupTaxonomy(tags, tag, 'id');

                          return (
                            <li key={`dig-tag-${tag.id}`}>
                              <Link to={`/digs/tags/${tag.slug}`}>
                                {tag.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </Column>
                  </Row>
                </Container>
              )}
            <BlogPosts
              type="recent"
              posts={posts.slice(0, 3)}
              categories={categories}
              tags={tags}
              locale={locale}
            />
            <BlogPosts
              type="previous"
              posts={posts.slice(3)}
              categories={categories}
              tags={tags}
              locale={locale}
            />
            {!outOfPosts && (
              <div id="more-posts">
                <Button onClick={this.loadMorePosts} color="dark-gray">
                  Load more posts
                </Button>
              </div>
            )}
          </div>
        )}
        {homepageLoaded && (
          <FooterLinks
            links={content.footer.links}
            socialMedia={content.general.social_media}
          />
        )}
      </Page>
    );
  }
}

const mapStateToProps = state => ({
  content: state.homepage.content,
  homepageLoaded: state.homepage.homepageLoaded,
  posts: state.blog.posts,
  categories: state.blog.categories,
  tags: state.blog.tags,
  postsReady:
    state.blog.postsLoaded &&
    state.blog.categoriesLoaded &&
    state.blog.tagsLoaded,
  outOfPosts: state.blog.outOfPosts
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ getContent, getPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(
  frontloadConnect(frontload, {
    onMount: true,
    onUpdate: false
  })(Blog)
);
