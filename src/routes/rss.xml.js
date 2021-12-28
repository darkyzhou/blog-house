import articles from '../../shared/articles';
import basicConfiguration from '../../config/basic-configuration.yml';
import RSS from 'rss';

const version = __BG__VERSION;

const feed = new RSS({
  title: basicConfiguration.blogName,
  description: basicConfiguration.description,
  generator: `Blog House v${version}`,
  feed_url: `${basicConfiguration.url}/rss.xml`,
  site_url: basicConfiguration.url,
  language: basicConfiguration.language.toLowerCase(),
  pubDate: new Date(),
  ttl: 120
});

for (const article of articles) {
  if (article.isPageArticle) {
    continue;
  }
  feed.item({
    title: article.title,
    description: article.excerpt,
    url: `${basicConfiguration.url}/articles/${article.slug}`,
    categories: [article.category],
    date: article.lastModifiedAt || article.date
  });
}

export async function get() {
  return {
    body: feed.xml()
  };
}
