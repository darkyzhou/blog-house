import articles from '../../shared/articles';
import tags from '../../shared/tags';
import constraints from '../../config/constraints.json';
import { concatPageUrl } from './_utils';

export async function get(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/xml' });

  const now = new Date().toISOString();
  const items = [];

  items.push({
    url: constraints.sitemap.urlPrefix,
    lastmod: now
  });

  items.push(
    ...articles.map((article) => ({
      url: concatPageUrl(article.slug),
      lastmod: new Date(article.lastModifiedAt).toISOString()
    })),
    ...tags.map((tag) => ({
      url: concatPageUrl(`tags/${tag.slug}`),
      lastmod: now
    }))
  );

  const content = items
    .map((item) => `<url><loc>${item.url}</loc><lastmod>${item.lastmod}</lastmod></url>`)
    .join('');

  response.end(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${content}</urlset>`
  );
}
