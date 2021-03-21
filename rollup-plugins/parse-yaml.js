const yaml = require('@rollup/plugin-yaml');
const objectPath = require('object-path');
const marked = require('./shared/marked-wrapped');

function range(to) {
  let result = [];
  for (let i = 0; i < to; i++) {
    result.push(i);
  }
  return result;
}

function resolveMarkdownFieldName(name, data) {
  if (!name.includes('.*.')) {
    return [name];
  } else {
    const array = objectPath.get(data, name.substr(0, name.indexOf('.*.')));
    return range(array.length)
      .map((i) => name.replace(/\*/, i))
      .map((mapped) => resolveMarkdownFieldName(mapped, data))
      .reduce((prev, curr) => [...prev, ...curr]);
  }
}

export default () =>
  yaml({
    transform(data) {
      const fieldNames = data['_markdownFields'];
      fieldNames
        .map((name) => resolveMarkdownFieldName(name, data))
        .reduce((prev, curr) => [...prev, ...curr])
        .forEach((name) =>
          objectPath.set(data, `${name}Html`, marked(objectPath.get(data, name) || ''))
        );
    }
  });
