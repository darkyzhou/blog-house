import articles from '../../../../shared/articles';

export async function get(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const { article } = req.params;
  res.end(JSON.stringify(articles.find((a) => a.slug === article)));
}
