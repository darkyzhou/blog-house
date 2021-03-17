const lunr = require('lunr');
require('lunr-languages-zh/lunr.stemmer.support')(lunr);
require('lunr-languages-zh/lunr.zh')(lunr);

export function buildIndexes(articles, tags) {
  const articleIndexes = lunr(function () {
    this.use(lunr.zh);

    this.ref('slug');
    this.field('title');
    this.field('content');
    this.field('tags');

    articles
      .filter((a) => !a.isPageArticle)
      .forEach((article) =>
        this.add({
          slug: article.slug,
          title: article.title,
          content: article.pureTextContent,
          tags: article.tags
        })
      );
  });

  const pageIndexes = lunr(function () {
    this.use(lunr.zh);

    this.ref('slug');
    this.field('title');
    this.field('content');

    articles
      .filter((a) => a.isPageArticle)
      .forEach((article) =>
        this.add({
          slug: article.slug,
          title: article.title,
          content: article.pureTextContent,
          tags: article.tags
        })
      );
  });

  const tagIndexes = lunr(function () {
    this.use(lunr.zh);
    this.ref('slug');
    this.field('title');
    this.field('content');

    tags.forEach((tag) =>
      this.add({
        type: 'tag',
        slug: tag.slug,
        title: tag.title,
        content: tag.description
      })
    );
  });

  return JSON.stringify({
    article: JSON.stringify(articleIndexes),
    page: JSON.stringify(pageIndexes),
    tag: JSON.stringify(tagIndexes)
  });
}
