import tags from './_tags';

export async function get(req, res, next) {
  const { tag } = req.params;
  if (!tags.has(tag)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Tag '${tag}' not found` }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(tags.get(tag));
  }
}
