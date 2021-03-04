import constraints from '../../config/constraints.json';

export function makeTitle(title) {
  return `${title} · ${constraints.base.blogName}`;
}
