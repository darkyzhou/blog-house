import articles from './articles/_articles';
import tags from './tags/_tags';
import constraints from '../../config/constraints.json';
import { concatPageUrl } from './_utils';

// FIXME: don't know why rollup complains about circular dependency issues if we use es import
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

export async function get(request, response) {
  const now = new Date().toISOString();
  const links = [];

  links.push({
    url: constraints.sitemap.urlPrefix,
    lastmod: now
  });

  links.push(
    articles.map((article) => ({
      url: concatPageUrl(article.slug),
      lastmod: new Date(article.lastModifiedAt).toISOString()
    }))
  );

  links.push(
    tags.map((tag) => ({
      url: concatPageUrl(`tags/${tag.slug}`),
      lastmod: now
    }))
  );

  const stream = new SitemapStream({ hostname: constraints.sitemap.urlPrefix });
  const contentBuffer = await streamToPromise(Readable.from(links).pipe(stream));
  response.end(contentBuffer);
}
