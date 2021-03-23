import tags from '../../../shared/tags';

const minifiedTags = tags.map((t) => ({
  ...t,
  articles: t.articles.map((a) => ({
    ...a,
    tableOfContent: undefined,
    html: undefined,
    pureTextContent: undefined
  }))
}));

export async function get(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(minifiedTags));
}
