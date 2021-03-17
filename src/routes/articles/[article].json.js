import articles from '../../../shared/articles';

export async function get(req, res, next) {
  const { article } = req.params;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(articles.find((a) => a.slug === article)));
}
