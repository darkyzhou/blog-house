import marked from 'marked';
import { getHighlighter, bundledThemes, bundledLanguages } from 'shiki';

const MARKED_RENDERER = new marked.Renderer();

const SHIKI_HIGHLIGHTER = await getHighlighter({
  themes: Object.keys(bundledThemes),
  langs: Object.keys(bundledLanguages)
});
const SHIKI_THEME = 'poimandres';

const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'webp', 'avif', 'png'];

function shouldOptimize(href) {
  return (
    href.startsWith('/') &&
    href.includes('.') &&
    SUPPORTED_IMAGE_FORMATS.includes(href.substring(href.lastIndexOf('.') + 1))
  );
}

function getOptimizedImageName(path, ext) {
  return `${path.substring(0, path.lastIndexOf('.'))}-bloghouse-opt.${ext}`;
}

const originalImageRenderer = MARKED_RENDERER.image;
MARKED_RENDERER.image = (href, title, text) => {
  const result = originalImageRenderer.call(MARKED_RENDERER, href, title, text);
  if (!shouldOptimize(href)) {
    return result;
  }
  return `<picture>
  <source srcset="${getOptimizedImageName(href, 'avif')}" type="image/avif" />
  <source srcset="${getOptimizedImageName(href, 'webp')}" type="image/webp" />
  <img src="${getOptimizedImageName(href, 'jpg')}" alt="${text}" loading="lazy" /></picture>`;
};

const originalLinkRenderer = MARKED_RENDERER.link;
MARKED_RENDERER.link = (href, title, text) => {
  const result = originalLinkRenderer.call(MARKED_RENDERER, href, title, text);
  switch (true) {
    case href.startsWith('/'):
      return result;
    case href.startsWith('#'):
      const newResult = originalLinkRenderer.call(MARKED_RENDERER, 'javascript:;', title, text);
      return newResult.replace(/^<a /, `<a onclick="document.location.hash='${href.substr(1)}';" `);
    default:
      return result.replace(/^<a /, '<a target="_blank" rel="nofollow noopener" ');
  }
};

const originalCodeRenderer = MARKED_RENDERER.code;
MARKED_RENDERER.code = (code, info, escaped) => {
  const result = originalCodeRenderer.call(MARKED_RENDERER, code, info, escaped).trim();
  const inner = result
    .replace(/^<pre><code[^>]*>/i, '')
    .replace(/<\/pre>.*/is, '</pre>')
    .replace('<pre ', '<pre data-overlayscrollbars-initialize ')
    .trim();
  return `<div class="code-wrapper">${inner}<div class="copy"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10zm0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2"/><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z"/></svg></div></div>`;
};

const highlight = (code, lang) => {
  switch (true) {
    case !SHIKI_HIGHLIGHTER.getLoadedLanguages().includes(lang):
      return SHIKI_HIGHLIGHTER.codeToHtml(code, { theme: SHIKI_THEME });
    default:
      return SHIKI_HIGHLIGHTER.codeToHtml(code, { theme: SHIKI_THEME, lang });
  }
};

marked.setOptions({ renderer: MARKED_RENDERER, highlight });

export default marked;
