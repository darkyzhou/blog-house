import articles from '../../../../shared/articles';

export function entries() {
  const pages = articles.filter((item) => !item.isPageArticle);
  return [...pages.map((item) => ({ article: item.slug }))];
}

export async function load({ params }) {
  const slug = params.article;
  const article = articles.find((item) => item.slug === slug);
  if (!article) {
    return null;
  }

  const articlesOfSameCategories = !article.category
    ? []
    : articles.filter((item) => item.category === article.category && item.slug !== article.slug);
  return {
    article,
    articlesOfSameCategories
  };
}
