import tags from '../../../../shared/tags';
import { json } from '@sveltejs/kit';

const minifiedTags = tags.map((t) => ({
  ...t,
  articles: t.articles.map((a) => ({
    ...a,
    tableOfContent: undefined,
    html: undefined,
    pureTextContent: undefined
  }))
}));

export async function GET() {
  return json(minifiedTags);
}
