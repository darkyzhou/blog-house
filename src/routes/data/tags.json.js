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

export async function get() {
  return {
    body: minifiedTags
  };
}
