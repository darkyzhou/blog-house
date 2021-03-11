import allArticles from '../../../source/**/*.md';

const articles = allArticles
  .map((article) => ({ ...article, html: article.html.replace(/^\t{3}/gm, '') }))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export default articles;
