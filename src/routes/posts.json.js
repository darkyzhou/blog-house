import posts from './_posts';

const responseJson = JSON.stringify(
  posts.map((p) => ({
    slug: p.slug,
    hidden: p.hidden,
    title: p.title,
    excerpt: p.excerpt,
    printDate: p.printDate,
    tags: p.tags
  }))
);

export async function get(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(responseJson);
}
