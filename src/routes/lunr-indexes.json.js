import articles from './articles/_articles';
import tags from './tags/_tags';
import { buildIndexes } from '../../shared/build-lunr-indexes';

export async function get(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(buildIndexes(articles, tags));
}
