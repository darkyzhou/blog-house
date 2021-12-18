import articles from '../../../../shared/articles';

export async function get({ params }) {
  const article = articles.find((a) => a.slug === params.article)
  if (article) {
    return {
      body: article
    };
  } else {
    return {
      status: 404
    }
  }
}
