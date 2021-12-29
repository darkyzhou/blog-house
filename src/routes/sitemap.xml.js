import articles from '../../shared/articles';
import tags from '../../shared/tags';
import basicConfiguration from '../../config/basic-configuration.yml';
import sitemapXmlConfiguration from '../../config/sitemap-xml-configuration.yml';
import { concatPageUrl } from './_utils';

export async function get() {
  const now = new Date().toISOString();
  const items = [];

  items.push({
    url: basicConfiguration.url,
    lastmod: now
  });

  items.push(
    ...articles
      .filter((a) => a.isPageArticle)
      .map((article) => ({
        url: concatPageUrl(article.slug),
        lastmod:
          article.lastModifiedAt || article.date
            ? new Date(article.lastModifiedAt || article.date).toISOString()
            : new Date().toISOString()
      })),
    ...articles
      .filter((a) => !a.isPageArticle)
      .map((article) => ({
        url: concatPageUrl(`articles/${article.slug}`),
        lastmod:
          article.lastModifiedAt || article.date
            ? new Date(article.lastModifiedAt || article.date).toISOString()
            : new Date().toISOString()
      })),
    ...tags
      .filter((t) => t.slug)
      .map((tag) => ({
        url: concatPageUrl(`tags/${tag.slug}`),
        lastmod: now
      }))
  );

  const content = items
    .map((item) => `<url><loc>${item.url}</loc><lastmod>${item.lastmod}</lastmod></url>`)
    .join('');

  return {
    body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${content}${sitemapXmlConfiguration.additionalContent.trim()}</urlset>`
  };
}
