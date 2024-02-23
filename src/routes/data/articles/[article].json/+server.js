import { json } from '@sveltejs/kit';
import articles from '../../../../../shared/articles';

export async function GET({ params }) {
  const article = articles.find((a) => a.slug === params.article);
  if (!article) {
    return new Response(undefined, { status: 404 });
  }

  return json(article);
}
