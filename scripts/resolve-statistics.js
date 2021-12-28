import removeMarkdown from 'remove-markdown';
import { readFile, readdir } from 'fs/promises';
import matter from 'gray-matter';

export async function getStatistics() {
  let wordsCount = 0;
  let articlesCount = 0;
  const tags = new Set();
  const categories = new Set();

  for (const file of await readdir('./source/_posts')) {
    articlesCount++;
    const md = (await readFile(`./source/_posts/${file}`)).toString();
    const { data, content } = matter(md);
    wordsCount += [...removeMarkdown(content)].length;
    if (data.tags) {
      for (const tag of data.tags) {
        tags.add(tag);
      }
    }
    if (data.category) {
      categories.add(data.category);
    }
  }
  return {
    articlesCount,
    wordsCount,
    tagsCount: [...tags].length,
    categoriesCount: [...categories].length
  };
}
