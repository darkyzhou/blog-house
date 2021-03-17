const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const { format } = require('date-fns');
const readingTime = require('reading-time');
const htmlParser = require('html5parser');
const prism = require('prismjs');
const fs = require('fs');
const parseTextContent = require('parse-html-text-content');
const constraints = require('./config/constraints.json');

function initMarked() {
  const renderer = new marked.Renderer();

  const originalLinkRenderer = renderer.link;
  renderer.link = (href, title, text) => {
    const result = originalLinkRenderer.call(renderer, href, title, text);
    switch (true) {
      case href.startsWith('/'):
        return result;
      case href.startsWith('#'):
        const newResult = originalLinkRenderer.call(renderer, 'javascript:;', title, text);
        return newResult.replace(
          /^<a /,
          `<a onclick="document.location.hash='${href.substr(1)}';" `
        );
      default:
        return result.replace(/^<a /, '<a target="_blank" rel="nofollow noopener" ');
    }
  };

  const originalCodeRenderer = renderer.code;
  renderer.code = (code, info, escaped) => {
    const result = originalCodeRenderer.call(renderer, code, info, escaped);
    return `${result.replace(/<\/pre>.*/is, '')}<div class='copy'></div></pre>\n`;
  };

  const highlight = (code, lang) => {
    if (!prism.languages[lang]) {
      return code;
    } else {
      return prism.highlight(code, prism.languages[lang], lang);
    }
  };

  // load all supported language from prismjs
  require('prismjs/components/')();

  marked.setOptions({ renderer, highlight });
}

function getReadingTime(content) {
  return !content ? 0 : readingTime(content).minutes.toFixed(0);
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
            throw new Error(`Unknown tag type: ${node.type}`);
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

function getSlugFromDirectory(filename) {
  return path.basename(path.dirname(filename));
}

function doTransform(mdContent, mdFilename) {
  const { data, content } = matter(mdContent);
  if (!data.title) {
    throw new Error(
      `Markdown file '${mdFilename}' should includes a title property in the front matter block`
    );
  }
  if (data.tags?.some((t) => !constraints.tag.items.find((tag) => tag.name === t))) {
    throw new Error(
      `Markdown file '${mdFilename}' contains a tag that does not described in 'config/constraints.json', make sure you've added the slug of it in the latter file`
    );
  }

  const contentHtml = marked(content);
  const pureTextContent = parseTextContent(contentHtml);

  const isPageArticle = isFromPage(mdFilename);
  const lastModifiedAt = getLatestModificationTime(mdFilename);
  const printLastModifiedAt = format(lastModifiedAt, 'yyyy/MM/dd');

  // NOTICE: by using JSON.stringify, all of the properties holding a Date value
  // will actually be converted into String!
  const output = JSON.stringify({
    slug: isPageArticle ? getSlugFromDirectory(mdFilename) : getSlugFromName(mdFilename),
    isPageArticle,
    lastModifiedAt,
    printLastModifiedAt,
    title: data.title,
    date: data.date ? new Date(data.date) : lastModifiedAt,
    printDate: data.date ? getPrintDate(data.date) : printLastModifiedAt,
    wordsCount: [...pureTextContent].length,
    readingTime: getReadingTime(pureTextContent),
    tags: isPageArticle ? [] : data.tags,
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
    throw new Error(`This file should be inside a directory in 'source'`);
  }
  if (path.basename(dirname) !== '_posts' && path.basename(id) !== 'index.md') {
    throw new Error(
      "This file under a specific directory other than '_posts' must be named 'index.md'"
    );
  }
  if (code?.trim()?.length <= 0) {
    throw new Error('This file is empty');
  }
}

initMarked();

export default () => ({
  transform(code, id) {
    if (!id.endsWith('.md')) {
      return null;
    }
    try {
      checkMarkdownFile(code, id);
      return doTransform(code, id);
    } catch (e) {
      this.error(`Failed to process markdown file '${id}':\n${e.stack}`);
    }
  }
});
