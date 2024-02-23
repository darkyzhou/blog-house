export async function load({ params, fetch }) {
  const articleSlug = params.page;
  const article = await (await fetch(`/data/articles/${articleSlug}.json`)).json();
  return { article };
}
