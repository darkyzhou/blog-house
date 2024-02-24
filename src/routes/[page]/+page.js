export async function load({ params, fetch }) {
  const articleSlug = params.page;
  const response = await fetch(`/data/articles/${articleSlug}.json`);
  if (!response.ok) {
    return null;
  }

  const article = await response.json();
  return { article };
}
