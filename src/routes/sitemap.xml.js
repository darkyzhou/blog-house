const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
import allPosts from './_posts';
import constraints from '../../config/constraints.json';

function concatPageUrl(pathName) {
  const url = new URL(constraints.sitemap.urlPrefix);
  url.pathname = `${pathName}/index.html`;
  return url.href;
}

export async function get(request, response) {
  response.setHeader('Cache-Control', 'max-age=0, s-max-age=600');
  response.setHeader('Content-Type', 'application/xml');

  const links = [];
  for (const post of allPosts) {
    links.push({
      url: concatPageUrl(post.slug),
      lastmod: new Date(post.lastModifiedAt).toISOString()
    });
  }

  const stream = new SitemapStream({ hostname: constraints.sitemap.urlPrefix });
  const contentBuffer = await streamToPromise(Readable.from(links).pipe(stream));
  response.end(contentBuffer);
}
