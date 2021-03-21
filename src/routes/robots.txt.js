import { concatPageUrl } from './_utils';

const sitemapContent = `
User-agent: *
Disallow: /admin/
Disallow: /stub/

Sitemap: ${concatPageUrl('sitemap.xml')}
`;

export async function get(request, response) {
  response.writeHead(200, { 'Content-Type': 'plain/text' });
  response.end(sitemapContent.trimLeft());
}
