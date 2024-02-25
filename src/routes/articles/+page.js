import articles from '../../../shared/articles';

export async function load({ fetch }) {
  return { articles };
}
