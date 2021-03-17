import tags from '../../../shared/tags';

export async function get(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(tags));
}
