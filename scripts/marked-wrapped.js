import marked from 'marked';
import shiki from 'shiki';

const renderer = new marked.Renderer();
const highlighter = await shiki.getHighlighter({ theme: 'github-dark-dimmed' });

function getOptimizedImageName(path, ext) {
  return `${path.substring(0, path.lastIndexOf('.'))}-bloghouse-opt.${ext}`;
}

const originalImageRenderer = renderer.image;
renderer.image = (href, title, text) => {
  const result = originalImageRenderer.call(renderer, href, title, text);
  if (!href.startsWith('/')) {
    return result;
  }
  return `<picture>
  <source srcset="${getOptimizedImageName(href, 'avif')}" type="image/avif" />
  <source srcset="${getOptimizedImageName(href, 'webp')}" type="image/webp" />
  <img src="${getOptimizedImageName(href, 'jpg')}" alt="${text}" loading="lazy" /></picture>`;
};

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
  const result = originalCodeRenderer.call(renderer, code, info, escaped).trim();
  switch (true) {
    case /<pre><code[^>]*><div class/i.test(result):
      return result.substring(result.indexOf('<div'), result.lastIndexOf('</div>') + 6);
    case /<pre><code[^>]*><a class/i.test(result):
      return result.substring(result.indexOf('<a'), result.lastIndexOf('</a>') + 4);
    default:
      return `${result
        .replace(/^<pre><code[^>]*>/i, '')
        .trim()
        .replace(/<\/pre>(.*)<\/pre>$/is, '')}<div class='copy'></div></pre>\n`;
  }
};

const messages = {
  info: {
    caption: '提示',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--carbon" width="16" height="16" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><defs></defs><path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 16 8zm4 16.125h-8v-2.25h2.875v-5.75H13v-2.25h4.125v8H20z" fill="currentColor"></path></svg>'
  },
  warn: {
    caption: '警告',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--carbon" width="16" height="16" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14s14-6.3 14-14S23.7 2 16 2zm-1.1 6h2.2v11h-2.2V8zM16 25c-.8 0-1.5-.7-1.5-1.5S15.2 22 16 22s1.5.7 1.5 1.5S16.8 25 16 25z" fill="currentColor"></path></svg>'
  },
  check: {
    caption: '提示',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--carbon" width="16" height="16" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><defs></defs><path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm-2 19.59l-5-5L10.59 15L14 18.41L21.41 11l1.596 1.586z" fill="currentColor"></path></svg>'
  },
  exception: {
    caption: '警告',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--carbon" width="16" height="16" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2zm5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4l-1.6 1.6z" fill="currentColor"></path></svg>'
  }
};
const validTypes = Object.getOwnPropertyNames(messages);

function resolveMessageOptions(input) {
  const regex = /^\$([+-]?)(\w+)(?:"(.*)")?$/i;
  const result = regex.exec(input);
  return {
    showIcon: !result[1] || result[1] === '+',
    type: validTypes.includes(result[2]) ? result[2] : 'info',
    caption: result[3] || null
  };
}

function toMessageHtml(option, content) {
  const { showIcon, type, caption } = resolveMessageOptions(option);
  return `<div class="bhem bh-${type}">
  ${!(showIcon || caption) ? '' : '<div class="bhemh">'}
  ${!showIcon ? '' : `<span class="bhemi">${messages[type].svg}</span>`}
  ${!caption ? '' : `<span class="bhemc">${caption || messages[type].caption}</span>`}
  ${!(showIcon || caption) ? '' : '</div>'}
  ${marked(content)}</div>`;
}

function resolveCardOptions(input) {
  const regex = /^#(?:(?:\(([^\)]+)\))?)(?:(?:\[([^\]]+)\])?)$/i;
  const result = regex.exec(input);
  return {
    imageUrl: result[1],
    link: result[2]
  };
}

function toCardHtml(option, content) {
  const { imageUrl, link } = resolveCardOptions(option);
  if (link) {
    return `<a target="_blank" href="${link}" class="bhc">${
      !imageUrl ? '' : `<div class="bhci" style="background-image: url('${imageUrl}')"></div>`
    }<div class="bhcc">${marked(content)}</div></a>`;
  }
  return `<div class="bhc">${
    !imageUrl ? '' : `<div class="bhci" style="background-image: url('${imageUrl}'}"></div>`
  }<div class="bhcc">${marked(content)}</div></div>`;
}

const highlight = (code, lang) => {
  switch (true) {
    case lang?.startsWith('$'):
      return toMessageHtml(lang, code);
    case lang?.startsWith('#'):
      return toCardHtml(lang, code);
    case !highlighter.getLoadedLanguages().includes(lang):
      return highlighter.codeToHtml(code, {});
    default:
      return highlighter.codeToHtml(code, { lang });
  }
};

marked.setOptions({ renderer, highlight });

export default marked;
