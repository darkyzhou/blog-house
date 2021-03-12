import constraints from '../../config/constraints.json';

export function makeTitle(title) {
  return `${title} · ${constraints.base.blogName}`;
}

export function concatPageUrl(pathName) {
  const url = new URL(constraints.sitemap.urlPrefix);
  url.pathname = `${pathName}`;
  return url.href;
}
