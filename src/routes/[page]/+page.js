import articles from '../../../shared/articles';

export function entries() {
  const pages = articles.filter((item) => item.isPageArticle);
  return [...pages.map((item) => ({ page: item.slug }))];
}

export async function load({ params }) {
  const slug = params.page;
  const article = articles.find((item) => item.slug === slug);
  if (!article) {
    return null;
  }
  return { article };
}
