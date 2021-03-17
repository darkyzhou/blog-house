import articles from '../articles/_articles';
import constraints from '../../../config/constraints.json';

function resolveTags(articles) {
  const tagsMapping = new Map();
  articles.forEach((article) =>
    article.tags?.forEach((tag) => {
      if (!tagsMapping.has(tag)) {
        const tagConfig = constraints.tag.items.find((t) => t.name === tag);
        console.assert(!!tagConfig);
        tagsMapping.set(tag, {
          articles: [article],
          slug: tagConfig.slug,
          description: tagConfig.description
        });
      } else {
        tagsMapping.get(tag).articles.push(article);
      }
    })
  );

  constraints.tag.items
    .filter((item) => !tagsMapping.has(item.name))
    .forEach((item) =>
      tagsMapping.set(item.name, {
        articles: [],
        slug: item.slug,
        description: item.description
      })
    );

  return [...tagsMapping.entries()].map(([tagName, detail]) => ({
    slug: detail.slug,
    name: tagName,
    articles: detail.articles,
    description: detail.description
  }));
}

const resolved = resolveTags(articles);

if (resolved.length <= 0) {
  console.warn('No tags found');
}

const tags = (resolved?.length <= 0 ? [] : resolved).sort((a, b) => a.name.localeCompare(b.name));

export default tags;
