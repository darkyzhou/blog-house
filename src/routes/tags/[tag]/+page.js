import tags from '../../../../shared/tags';

export function entries() {
  return [...tags.map((item) => ({ tag: item.slug }))];
}

export async function load({ params }) {
  const slug = params.tag;
  const tag = tags.find((item) => item.slug === slug);
  return { tag };
}
