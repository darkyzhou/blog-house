export async function load({ fetch }) {
  const response = await fetch('/data/tags.json');
  const tags = await response.json();
  return { tags };
}
