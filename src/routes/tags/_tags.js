import posts from '../_posts';
import constraints from '../../../config/constraints.json';

function resolveTags(posts) {
  const tagsMapping = new Map();
  posts.forEach((post) =>
    post.tags?.forEach((tag) => {
      if (!tagsMapping.has(tag)) {
        const tagConfig = constraints.tag.items.find((t) => t.name === tag);
        console.assert(!!tagConfig);
        tagsMapping.set(tag, {
          posts: [post],
          slug: tagConfig.slug,
          description: tagConfig.description
        });
      } else {
        tagsMapping.get(tag).posts.push(post);
      }
    })
  );

  constraints.tag.items
    .filter((item) => !tagsMapping.has(item.name))
    .forEach((item) =>
      tagsMapping.set(item.name, {
        posts: [],
        slug: item.slug,
        description: item.description
      })
    );

  return [...tagsMapping.entries()].map(([tagName, detail]) => ({
    slug: detail.slug,
    name: tagName,
    posts: detail.posts,
    description: detail.description
  }));
}

const tags = resolveTags(posts).sort((a, b) => a.name.localeCompare(b.name));

export default tags;
