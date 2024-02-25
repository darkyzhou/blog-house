import categories from '../../../../shared/categories';

export function entries() {
  return [...categories.map((item) => ({ category: item.slug }))];
}

export async function load({ params }) {
  const slug = params.category;
  const category = categories.find((item) => item.slug === slug);
  return { category };
}
