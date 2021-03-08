import posts from './_posts';

const postsMapping = new Map(posts.map((p) => [p.slug, JSON.stringify(p)]));

export async function get(req, res, next) {
  const { post } = req.params;
  if (!postsMapping.has(post)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Post '${post}' not found` }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(postsMapping.get(post));
  }
}
