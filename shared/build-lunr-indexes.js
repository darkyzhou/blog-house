const lunr = require('lunr');
require('lunr-languages-with-chinese-support/lunr.stemmer.support')(lunr);
require('lunr-languages-with-chinese-support/lunr.zh')(lunr);

export function buildIndexes(articles, tags) {
  const indexes = lunr(function () {
    this.use(lunr.zh);
    this.ref('slug');
    this.field('title');
    this.field('content');

    articles.forEach((article) =>
      this.add({
        type: 'article',
        slug: article.slug,
        title: article.title,
        content: article.pureTextContent
      })
    );

    tags.forEach((tag) =>
      this.add({
        type: 'tag',
        slug: tag.slug,
        title: tag.title,
        content: tag.description
      })
    );
  });
  return JSON.stringify(indexes);
}
