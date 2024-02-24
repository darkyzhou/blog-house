export async function load({ params, fetch }) {
  const slug = params.category;
  const response = await fetch('/data/categories.json');
  const categories = await response.json();
  const target = categories.find((t) => t.slug === slug);
  return { category: target };
}
