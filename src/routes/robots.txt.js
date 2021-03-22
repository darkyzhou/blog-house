import { concatPageUrl } from './_utils';
import robotsTxtConfiguration from '../../config/robots-txt-configuration.yml';

const sitemapContent = `
${robotsTxtConfiguration.additionalContent.trim()}

Sitemap: ${concatPageUrl('sitemap.xml')}
`;

export async function get(request, response) {
  response.writeHead(200, { 'Content-Type': 'plain/text' });
  response.end(sitemapContent.trimLeft());
}
