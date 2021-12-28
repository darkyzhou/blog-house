import yaml from 'yaml';
import fs from 'fs';

const homeConfig = yaml.parse(fs.readFileSync('./config/home-page-configuration.yml').toString());
const footerConfig = yaml.parse(fs.readFileSync('./config/footer-configuration.yml').toString());

function replaceIconsMark(mark, content, icons) {
  const imports = icons
    .filter((icon) => icon !== 'null')
    .map((icon) => `import ${icon} from 'carbon-icons-svelte/lib/${icon}';`)
    .join('');
  const array = icons.map((icon) => `${icon},`).join('');
  return {
    code: content.replace(`const ICONS = []; //${mark}`, `${imports}const ICONS=[${array}];`)
  };
}

// we are not using dynamic imports to load icons here (though it is feasible)
// because rollup has the limitations that it must scan over all of the carbon-design-icons files
// leading to compiling being too slow and even failing with an oom error.
export default {
  script({ content }) {
    if (content.includes('@MARK:TABS') && homeConfig.tabsContent?.length > 0) {
      const icons = homeConfig.tabsContent.map((item) => {
        if (!item.icon) {
          console.error('preprocess-icons.js: missing icon property for tabsContent');
        }
        return item.icon.trim();
      });
      return replaceIconsMark('@MARK:TABS', content, icons);
    }

    if (content.includes('@MARK:CONTACTS') && homeConfig.contact?.length > 0) {
      const icons = homeConfig.contact.map((item) => {
        if (!item.type) {
          console.error('preprocess-icons.js: missing icon property for type');
        }
        return item.type.trim();
      });
      return replaceIconsMark('@MARK:CONTACTS', content, icons);
    }

    if (content.includes('@MARK:FOOTER') && footerConfig.additional?.length > 0) {
      const icons = footerConfig.additional.map((item) => {
        if (!item.type) {
          console.error('preprocess-icons.js: missing icon property for type');
        }
        return item.icon?.trim() || 'null';
      });
      return replaceIconsMark('@MARK:FOOTER', content, icons);
    }
  }
};
