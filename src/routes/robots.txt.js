import { concatPageUrl } from './_utils';
import robotsTxtConfiguration from '../../config/robots-txt-configuration.yml';

const sitemapContent = `
${robotsTxtConfiguration.additionalContent.trim()}

Sitemap: ${concatPageUrl('sitemap.xml')}
`;

export async function get() {
  return {
    body: sitemapContent.trim()
  };
}
