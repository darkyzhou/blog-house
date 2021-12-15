import articles from '../../../../shared/articles';

export async function get({ params }) {
  return {
    body: articles.find((a) => a.slug === params.article)
  };
}
