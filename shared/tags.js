import articles from './articles';
import tagsConfiguration from '../config/tags-configuration.yml';
import { slugify } from 'transliteration';

function resolveTags(articles) {
  const predefinedTags = tagsConfiguration.tags;
  const tagsMapping = new Map();

  articles.forEach((article) =>
    article.tags?.forEach((name) => {
      if (tagsMapping.has(name)) {
        const tag = tagsMapping.get(name);
        tag.articles.push(article);
        return;
      }
      const predefinedTag = predefinedTags.find((t) => t.name === name);
      tagsMapping.set(name, {
        articles: [article],
        slug: predefinedTag?.slug,
        description: predefinedTag?.description
      });
    })
  );

  predefinedTags
    .filter((item) => !tagsMapping.has(item.name))
    .forEach((item) =>
      tagsMapping.set(item.name, {
        articles: [],
        slug: item.slug,
        description: item.description
      })
    );

  return [...tagsMapping.entries()].map(([tagName, detail]) => ({
    name: tagName,
    articles: detail.articles,
    slug: detail.slug || slugify(tagName),
    description: detail.description || '暂无描述'
  }));
}

const resolved = resolveTags(articles);

if (resolved.length <= 0) {
  console.warn('tags.js: No tags found');
}

const tags = (resolved?.length <= 0 ? [] : resolved).sort((a, b) => a.name.localeCompare(b.name));

export default tags;
