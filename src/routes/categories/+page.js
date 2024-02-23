export async function load({ fetch }) {
  const response = await fetch('/data/categories.json');
  const categories = await response.json();
  return { categories };
}
