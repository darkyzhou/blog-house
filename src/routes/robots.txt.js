import articles from './articles/_articles';
import tags from './tags/_tags';
import constraints from '../../config/constraints.json';
import { concatPageUrl } from './_utils';

const sitemapContent = `
User-agent: *
Disallow: /admin/

Sitemap: ${concatPageUrl('sitemap.xml')}
`;

export async function get(request, response) {
  response.end(sitemapContent.trimLeft());
}
