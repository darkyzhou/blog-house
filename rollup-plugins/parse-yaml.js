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
    if (!objectPath.has(data, name)) {
      console.warn(
        `parse-yaml.js: A YAML object has no field '${name}' which is specified in '_markdownFields', now ignoring it. The object: ${JSON.stringify(
          data
        )}`
      );
      return [];
    }
    return [name];
  } else {
    const arrayName = name.substr(0, name.indexOf('.*.'));
    const array = objectPath.get(data, arrayName);
    if (!array) {
      console.warn(
        `parse-yaml.js: A YAML object has no array '${arrayName}', which is specified in '_markdownFields', now ignoring it. The object: ${JSON.stringify(
          data
        )}`
      );
      return [];
    }
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
      if (fieldNames?.length > 0) {
        fieldNames
          .map((name) => resolveMarkdownFieldName(name, data))
          .reduce((prev, curr) => [...prev, ...curr])
          .forEach((name) =>
            objectPath.set(data, `${name}Html`, marked(objectPath.get(data, name) || ''))
          );
      }
    }
  });
