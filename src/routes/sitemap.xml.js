import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import posts from './_posts';
import tags from './tags/_tags';
import constraints from '../../config/constraints.json';

function concatPageUrl(pathName) {
  const url = new URL(constraints.sitemap.urlPrefix);
  url.pathname = `${pathName}`;
  return url.href;
}

export async function get(request, response) {
  response.setHeader('Cache-Control', 'max-age=0, s-max-age=600');
  response.setHeader('Content-Type', 'application/xml');

  const now = new Date().toISOString();
  const links = [];

  links.push({
    url: constraints.sitemap.urlPrefix,
    lastmod: now,
    changefreq: 'daily',
    priority: 0.6
  });

  links.push(
    posts.map((post) => ({
      url: concatPageUrl(post.slug),
      lastmod: new Date(post.lastModifiedAt).toISOString()
    }))
  );

  links.push(
    tags.map((tag) => ({
      url: concatPageUrl(`tags/${tag.slug}`),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.6
    }))
  );

  const stream = new SitemapStream({ hostname: constraints.sitemap.urlPrefix });
  const contentBuffer = await streamToPromise(Readable.from(links).pipe(stream));
  response.end(contentBuffer);
}
