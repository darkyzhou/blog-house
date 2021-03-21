const yaml = require('@rollup/plugin-yaml');
const marked = require('./shared/marked-wrapped');

export default () =>
  yaml({
    transform(data, filePath) {
      // FIXME: this is an awful way to achieve that
      if (filePath.endsWith('home-page-configuration.yml')) {
        data.tabsContent = data.tabsContent.map((item) => ({
          ...item,
          contentHtml: marked(item.content || '')
        }));
      }
    }
  });
