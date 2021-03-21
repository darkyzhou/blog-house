const marked = require('marked');
const prism = require('prismjs');

const renderer = new marked.Renderer();

const originalLinkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  const result = originalLinkRenderer.call(renderer, href, title, text);
  switch (true) {
    case href.startsWith('/'):
      return result;
    case href.startsWith('#'):
      const newResult = originalLinkRenderer.call(renderer, 'javascript:;', title, text);
      return newResult.replace(/^<a /, `<a onclick="document.location.hash='${href.substr(1)}';" `);
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

module.exports = marked;
