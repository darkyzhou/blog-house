const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const { format } = require('date-fns');
const readingTime = require('reading-time');
const htmlParser = require('html5parser');
const prism = require('prismjs');

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
        return result.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
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
  return !date ? undefined : format(new Date(date), 'yyyy-MM-dd');
}

function getTableOfContent(contentHtml) {
  const htmlAst = htmlParser.parse(contentHtml);
  let tableOfContent = [];
  const resolveText = (nodes) => {
    return (nodes || [])
      .map((node) => {
        switch (node.type) {
          case htmlParser.SyntaxKind.Tag:
            return resolveText(node.body);
          case htmlParser.SyntaxKind.Text:
            return node.value;
          default:
            throw new Error(`unknown tag type: ${node.type}`);
        }
      })
      .join('');
  };
  htmlParser.walk(htmlAst, {
    enter(node, parent, index) {
      if (
        parent ||
        node.type !== htmlParser.SyntaxKind.Tag ||
        !/^h[123456]$/.test(node.name) ||
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
      tableOfContent = tableOfContent.concat(data);
    }
  });
  return !tableOfContent.length ? undefined : tableOfContent;
}

const EXCERPT_SEPARATOR = '<!-- more -->';
function getExcerptAndMainContent(content) {
  if (content.includes(EXCERPT_SEPARATOR)) {
    return content.split(EXCERPT_SEPARATOR);
  } else {
    // TODO: extract plain-text only
    return [content.substr(0, 120).replace(/\n/g, '').trim().concat('...'), content];
  }
}

function doTransform(mdContent, mdFilename) {
  const { data, content } = matter(mdContent);
  if (!data.title) {
    throw new Error(
      `Markdown file '${mdFilename}' should includes a title property in the front matter block`
    );
  }

  const [excerpt, mainContent] = getExcerptAndMainContent(content);
  const mainContentHtml = marked(mainContent);

  const output = JSON.stringify({
    slug: path.basename(mdFilename).split('.')[0],
    title: data.title,
    hidden: data.hidden,
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
  transform(md, id) {
    if (!/\.md$/.test(id)) {
      return null;
    }
    if (md?.trim()?.length <= 0) {
      throw new Error(`Empty markdown file '${id}'`);
    }
    try {
      return doTransform(md, id);
    } catch (e) {
      throw new Error(`Failed to process markdown file '${id}':\n${e.stack}`);
    }
  }
});
