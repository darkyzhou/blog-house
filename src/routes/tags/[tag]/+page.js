export async function load({ params, fetch }) {
  const tagSlug = params.tag;
  const response = await fetch('/data/tags.json');
  const tags = await response.json();
  const targetTag = tags.find((t) => t.slug === tagSlug);
  return { tag: targetTag };
}
