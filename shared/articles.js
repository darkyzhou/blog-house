import allArticles from '../source/{_pages,_posts}/*.md';

if (allArticles?.length <= 0) {
  console.warn("articles.js: No articles found inside 'source/_posts' and 'source/_pages' folder");
}

const articles =
  allArticles?.length <= 0
    ? []
    : allArticles
        .map((article) => ({ ...article, html: article.html.replace(/^\t{3}/gm, '') }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

export default articles;
