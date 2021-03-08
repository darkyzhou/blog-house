const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const { format } = require('date-fns');
const readingTime = require('reading-time');
const htmlParser = require('html5parser');
const prism = require('prismjs');
const fs = require('fs');
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

function getReadingTime(contentHtml) {
  return !contentHtml ? 0 : readingTime(contentHtml).minutes;
}

function getPrintDate(date) {
  return !date ? undefined : format(new Date(date), 'yyyy/MM/dd');
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

const EXCERPT_SEPARATOR = '<!-- more -->';
function getExcerptAndMainContent(content) {
  if (content.includes(EXCERPT_SEPARATOR)) {
    return content.split(EXCERPT_SEPARATOR);
  } else {
    return [undefined, content];
  }
}

function getLatestModificationTime(filename) {
  const { mtime } = fs.lstatSync(filename);
  return mtime.toISOString();
}

function isFromPage(filename) {
  const parentDirectoryName = path.basename(path.dirname(filename));
  return parentDirectoryName !== 'source';
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

  const [excerpt, mainContent] = getExcerptAndMainContent(content);
  const mainContentHtml = marked(mainContent);

  const isPageArticle = isFromPage(mdFilename);

  const output = JSON.stringify({
    isPageArticle,
    slug: isPageArticle ? getSlugFromDirectory(mdFilename) : getSlugFromName(mdFilename),
    lastModifiedAt: getLatestModificationTime(mdFilename),
    title: data.title,
    date: data.date,
    excerpt,
    printDate: getPrintDate(data.date),
    printReadingTime: getReadingTime(mainContentHtml),
    tags: data.tags,
    tableOfContent: getTableOfContent(mainContentHtml),
    html: mainContentHtml
  });

  return {
    code: `export default ${output}`,
    map: { mappings: '' }
  };
}

initMarked();

export default () => ({
  transform(code, id) {
    if (!id.endsWith('.md')) {
      return null;
    }
    if (path.basename(path.dirname(id)) !== 'source' && path.basename(id) !== 'index.md') {
      this.error(`Markdown file under a specific directory must be named 'index.md': ${id}`);
    }
    if (code?.trim()?.length <= 0) {
      this.error(`Empty markdown file '${id}'`);
    }
    try {
      return doTransform(code, id);
    } catch (e) {
      this.error(`Failed to process markdown file '${id}':\n${e.stack}`);
    }
  }
});
