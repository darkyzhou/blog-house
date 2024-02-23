import { json } from '@sveltejs/kit';
import articles from '../../../../shared/articles';

export async function GET() {
  return json(
    articles.map((a) => ({
      ...a,
      tableOfContent: undefined,
      html: undefined,
      pureTextContent: undefined
    }))
  );
}
