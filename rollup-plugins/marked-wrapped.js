import marked from 'marked';
import shiki from 'shiki';

const renderer = new marked.Renderer();
const highlighter = await shiki.getHighlighter({ theme: 'github-dark-dimmed' });

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
  if (code.includes('Delegate')) {
    console.log(result);
  }
  return `${result.replace(/^<pre><code[^>]*>/is, '').trim().replace(/<\/pre>(.*)<\/pre>$/is, '')}<div class='copy'></div></pre>\n`;
};

const highlight = (code, lang) => {
  return highlighter.codeToHtml(code, { lang });
};

marked.setOptions({ renderer, highlight });

export default marked;
