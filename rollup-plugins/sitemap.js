const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
const constraints = require('./config/constraints.json');

function concatUrl(pathName) {
  const url = new URL(constraints.sitemap.urlPrefix);
  url.pathname = pathName;
  return url.href;
}

export default () => ({
  async closeBundle() {
    console.log('😁 Generating sitemap');
    const markdownFiles = fs
      .readdirSync(path.resolve(__dirname, 'posts'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => [path.resolve(__dirname, 'posts', name), name.split('.')[0]]);

    let links = [];
    for (const [filePath, name] of markdownFiles) {
      const { mtime } = fs.lstatSync(filePath);
      links = links.concat({ url: concatUrl(name), lastmod: mtime.toISOString() });
    }

    const stream = new SitemapStream({ hostname: constraints.sitemap.urlPrefix });
    const contentBuffer = await streamToPromise(Readable.from(links).pipe(stream));
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: contentBuffer });
  }
});
