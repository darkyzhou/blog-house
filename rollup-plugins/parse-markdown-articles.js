import path from 'path';
import matter from 'gray-matter';
import { format } from 'date-fns';
import htmlParser from 'html5parser';
import fs from 'fs';
import parseTextContent from 'parse-html-text-content';
import marked from './marked-wrapped.js';

function getReadingTime(wordsCount) {
  return Math.max(1, wordsCount / 420).toFixed(0);
}

function getPrintDate(date) {
  return !date ? undefined : format(date, 'yyyy/MM/dd');
}

function getTableOfContent(contentHtml) {
  const htmlAst = htmlParser.parse(contentHtml);
  const tableOfContent = [];
  const resolveText = (nodes) => {
    return (nodes || [])
      .map((node) => {
        switch (node.type) {
          case htmlParser.SyntaxKind.Tag:
            return resolveText(node.body);
          case htmlParser.SyntaxKind.Text:
            return node.value;
          default:
            throw new Error(`parse-markdown-articles.js: Unknown tag type: ${node.type}`);
        }
      })
      .join('');
  };
  htmlParser.walk(htmlAst, {
    enter(node, parent, index) {
      if (
        parent ||
        node.type !== htmlParser.SyntaxKind.Tag ||
        !/^h[1-6]$/.test(node.name) ||
        !Array.isArray(node.body) ||
        !node.body[0]
      ) {
        return;
      }
      let data = {
        headingLevel: Number(node.name.charAt(1)),
        caption: resolveText(node.body)
      };
      if (node.attributes) {
        const attribute = node.attributes.find((a) => a.name.value === 'id');
        if (attribute) {
          data = { ...data, id: attribute.value.value };
        }
      }
      tableOfContent.push(data);
    }
  });
  return !tableOfContent.length ? undefined : tableOfContent;
}

function getLatestModificationTime(filename) {
  const { mtime } = fs.lstatSync(filename);
  return mtime;
}

function extractExcerpt(pureTextContent) {
  return `${pureTextContent.substr(0, 160)}...`;
}

function isFromPage(filename) {
  const parentDirectoryName = path.basename(path.dirname(filename));
  return !['source', '_posts'].includes(parentDirectoryName);
}

function getSlugFromName(filename) {
  return path.basename(filename).split('.')[0];
}

function doTransform(mdContent, mdFilename) {
  const { data, content } = matter(mdContent);
  if (!data.title) {
    throw new Error(
      `parse-markdown-articles.js: Markdown file '${mdFilename}' should includes a title property in the front matter block`
    );
  }

  const contentHtml = marked(content);
  const pureTextContent = parseTextContent(contentHtml);

  const isPageArticle = isFromPage(mdFilename);
  const lastModifiedAt = getLatestModificationTime(mdFilename);
  const printLastModifiedAt = format(lastModifiedAt, 'yyyy/MM/dd');
  const wordsCount = [...pureTextContent].length;

  // NOTICE: by using JSON.stringify, all of the properties holding a Date value
  // will actually be converted into String!
  const output = JSON.stringify({
    slug: getSlugFromName(mdFilename),
    isPageArticle,
    lastModifiedAt,
    printLastModifiedAt,
    title: data.title,
    date: data.date ? new Date(data.date) : lastModifiedAt,
    printDate: data.date ? getPrintDate(data.date) : printLastModifiedAt,
    wordsCount,
    readingTime: getReadingTime(wordsCount),
    tags: isPageArticle ? null : data.tags,
    excerpt: data.excerpt || extractExcerpt(pureTextContent),
    tableOfContent: getTableOfContent(contentHtml),
    html: contentHtml,
    pureTextContent
  });

  return {
    code: `export default ${output}`,
    map: { mappings: '' }
  };
}

function checkMarkdownFile(code, id) {
  const filePath = path.resolve(id);
  const dirname = path.dirname(filePath);
  if (
    path.basename(dirname) === 'source' &&
    path.basename(filePath.substring(0, filePath.lastIndexOf('source'))) !== 'source'
  ) {
    throw new Error(
      `parse-markdown-articles.js: This file should be inside a directory in 'source'`
    );
  }
  if (code?.trim()?.length <= 0) {
    throw new Error('parse-markdown-articles.js: This file is empty');
  }
}

export default () => ({
  name: 'markdown',
  transform(code, id) {
    if (!id.endsWith('.md')) {
      return null;
    }
    try {
      checkMarkdownFile(code, id);
      return doTransform(code, id);
    } catch (e) {
      this.error(
        `parse-markdown-articles.js: Failed to process markdown file '${id}':\n${e.stack}`
      );
    }
  }
});
