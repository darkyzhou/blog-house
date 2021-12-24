import algoliasearch from 'algoliasearch';
import env from 'dotenv';
import removeMarkdown from 'remove-markdown';
import fs from 'fs';
import { readFile, readdir } from 'fs/promises';
import matter from 'gray-matter';
import yaml from 'yaml';
import path from 'path';

env.config();

const config = yaml.parse(fs.readFileSync('./config/basic-configuration.yml').toString());
const tagsConfig = yaml.parse(fs.readFileSync('./config/tags-configuration.yml').toString());
const categoriesConfig = yaml.parse(
  fs.readFileSync('./config/categories-configuration.yml').toString()
);

async function work() {
  if (
    process.env.NODE_ENV !== 'development' &&
    (!config.algolia || config.algolia.enabled !== 'true')
  ) {
    console.log('algolia disabled, skip uploading');
    return;
  }

  const indexName = process.env.ALGO_INDEX || config.algolia.index;
  const appId = process.env.ALGO_APPID || config.algolia.applicationId;
  const apiKey = process.env.ALGO_ADMINKEY || config.algolia.adminApiKey;
  if (!indexName || !appId || !apiKey) {
    throw new Error(
      'upload-to-algolia.js: index name, application id or admin api key is not specified'
    );
  }

  const client = algoliasearch(appId, apiKey);
  const index = client.initIndex(indexName);

  const { articles, categoryIndexes } = await resolveArticles();
  const pages = await resolvePages();

  console.log(
    `upload-to-algolia.js: generated ${articles.length} article indexes and ${categoryIndexes.length} category indexes`
  );
  await index.saveObjects([...articles, ...categoryIndexes]);
  console.log('uploaded to algolia');
}

async function resolveArticles() {
  const mdFiles = await readdir('./source/_posts');
  const articles = [];
  const tags = new Set();
  const categories = new Set();

  for (const file of mdFiles) {
    const md = (await readFile(`./source/_posts/${file}`)).toString();
    const { data, content } = matter(md);
    const article = {
      type: 'article',
      objectID: `article-${path.basename(file).split('.')[0]}`,
      slug: path.basename(file).split('.')[0],
      title: data.title,
      content: removeMarkdown(content),
      category: data.category,
      tags: data.tags?.join(' '),
    };
    if (data.date) {
      article.printDate = new Date(data.date).toISOString();
    }
    if (data.modificationDate) {
      article.modificationDate = new Date(data.modificationDate).toISOString();
    }
    articles.push(article);
    if (data.tags) {
      for (const tag of data.tags) {
        tags.add(tag);
      }
    }
    if (data.category) {
      categories.add(data.category);
    }
  }

  // const tagIndexes = [...tags]
  //   .map((t) => {
  //     if (!tagsConfig.tags.find((item) => item.name === t)) {
  //       console.warn(
  //         `upload-to-algolia.js: ignoring tag ${t} due to not being configured in tags-configuration.yml`
  //       );
  //       return null;
  //     }
  //     const tag = tagsConfig.tags.find((item) => item.name == t);
  //     return {
  //       type: 'tag',
  //       objectID: `tag-${tag.slug}`,
  //       slug: tag.slug,
  //       title: tag.name
  //     };
  //   })
  //   .filter((item) => !!item);

  const categoryIndexes = [...categories]
    .map((c) => {
      if (!categoriesConfig.categories.find((item) => item.name === c)) {
        console.warn(
          `upload-to-algolia.js: ignoring category ${c} due to not being configured in categories-configuration.yml`
        );
        return null;
      }
      const category = categoriesConfig.categories.find((item) => item.name == c);
      return {
        type: 'category',
        objectID: `category-${category.slug}`,
        slug: category.slug,
        title: category.name,
        content: category.description
      };
    })
    .filter((item) => !!item);

  return { articles, categoryIndexes };
}

async function resolvePages() {
  const mdFiles = await readdir('./source/_pages');
  const result = [];
  for (const file of mdFiles) {
    const md = (await readFile(`./source/_pages/${file}`)).toString();
    const { data } = matter(md);
    result.push({
      type: 'page',
      objectID: `page-${path.basename(file).split('.')[0]}`,
      title: data.title,
      content: removeMarkdown(md)
    });
  }
  return result;
}

work().catch((err) => {
  console.error('failed to upload indexes to algolia:', err);
});
