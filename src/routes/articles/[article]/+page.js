export async function load({ params, fetch }) {
  const articleSlug = params.article;
  const article = await (await fetch(`/data/articles/${articleSlug}.json`)).json();
  const allArticles = !article.category ? [] : await (await fetch(`/data/articles.json`)).json();
  const articlesOfSameCategories = allArticles.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  );
  return {
    article,
    articlesOfSameCategories
  };
}
