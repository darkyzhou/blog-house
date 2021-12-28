import categories from '../../../shared/categories';

const minified = categories.map((t) => ({
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
    body: minified
  };
}
