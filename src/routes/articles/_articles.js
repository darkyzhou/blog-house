import allArticles from '../../../source/**/*.md';

if (allArticles?.length <= 0) {
  console.warn("No articles found inside 'source' folder");
}

const articles =
  allArticles?.length <= 0
    ? []
    : allArticles
        .map((article) => ({ ...article, html: article.html.replace(/^\t{3}/gm, '') }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

export default articles;
