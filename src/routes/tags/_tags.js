import posts from '../_posts';
import constraints from '../../../config/constraints.json';

function resolveTags(posts) {
  const tagsMapping = new Map();
  posts.forEach((post) =>
    post.tags?.forEach((tag) => {
      if (!tagsMapping.has(tag)) {
        tagsMapping.set(tag, { posts: [post], description: constraints.tag.descriptions[tag] });
      } else {
        tagsMapping.get(tag).posts.push(post);
      }
    })
  );
}

const tags = resolveTags(posts);

export default tags;
