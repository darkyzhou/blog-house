export async function load({ fetch }) {
  const response = await fetch('/data/articles.json');
  const articles = await response.json();
  return { articles };
}
