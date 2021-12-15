import articles from '../../../shared/articles';

export async function get() {
  return {
    body: articles.map((a) => ({
      ...a,
      tableOfContent: undefined,
      html: undefined,
      pureTextContent: undefined
    }))
  };
}
