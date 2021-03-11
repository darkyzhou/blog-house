import posts from './_articles';

const postsMapping = new Map(posts.map((p) => [p.slug, JSON.stringify(p)]));

export async function get(req, res, next) {
  const { article } = req.params;
  if (!postsMapping.has(article)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Article '${article}' not found` }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(postsMapping.get(article));
  }
}
