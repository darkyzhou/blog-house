import categoriesConfiguration from '../config/categories-configuration.yml';
import articles from './articles';
import { slugify } from 'transliteration';

function resolveCategories(articles) {
  const predefined = categoriesConfiguration.categories;
  const map = new Map();

  articles
    .filter((a) => !!a.category)
    .forEach((a) => {
      const category = a.category;
      if (map.has(category)) {
        map.get(category).articles.push(a);
      } else {
        const c = predefined.find((c) => c.name === category);
        map.set(category, {
          articles: [a],
          slug: c.slug,
          description: c.description
        });
      }
    });

  predefined
    .filter((c) => !map.has(c.name))
    .forEach((c) =>
      map.set(c.name, {
        articles: [],
        slug: c.slug,
        description: c.description
      })
    );

  return [...map.entries()].map(([tagName, detail]) => ({
    name: tagName,
    articles: detail.articles,
    slug: detail.slug || slugify(tagName),
    description: detail.description || '暂无描述'
  }));
}

const resolved = resolveCategories(articles);

if (resolved.length <= 0) {
  console.warn('categories.js: No categories found');
}

export default (resolved?.length <= 0 ? [] : resolved).sort((a, b) => a.name.localeCompare(b.name));
