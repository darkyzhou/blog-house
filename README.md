<p align="center">
  <img width="300" src="https://github.com/blog-house/blog-house/raw/master/logo.png" alt="Blog house logo">
</p>
<h2 align="center">Blog House</h2>
<p align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/blog-house/blog-house">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/blog-house/blog-house">
  <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/blog-house/blog-house">
  <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/blog-house/blog-house">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/blog-house/blog-house?style=social">
</p>

### 简介

[Blog House](https://github.com/blog-house/blog-house) 是一个基于 Web 前端框架 [SvelteKit](https://kit.svelte.dev/) 的静态博客生成器，后者基于 [Svelte](https://svelte.dev/)。

### 特色

- **SSG + SPA 混合模式**。用户首次打开网站时会直接下载静态 html 展示页面，之后会自动加载 SvelteKit 运行时，[它能够预判用户的访问动作，自动预加载响应的网页数据](https://kit.svelte.dev/docs#anchor-options-sveltekit-prefetch)。当用户点击文章之后，SvelteKit 会在 SPA 的模式下立刻渲染出网页，而不是像传统的 SSG 博客那样需要浏览器再去下载 html 等，大大提升用户体验。
- **Algolia 适配**。提供基于 [Algolia](https://algolia.com) 的搜索功能，且索引上传、同步工作完全全自动。
- **Giscus 适配**。提供基于 [Giscus](https://giscus.app) 的评论区功能，用户使用 GitHub 账号登录即可发表评论。
- **自动图片优化**。博客中的所有图片都会被自动优化，转换为 AVIF、webp、progressive JPEG 格式，利用 `<picture>` 元素指示浏览器按需加载。同时自动加入 `loading=lazy` 来启动异步图片加载。
- **RSS、SEO、Sitemap支持**。自动生成 `rss.xml`、`sitemap.xml` 等。

### Demo

请见作者的个人博客：[Darky's Blog](https://darkyzhou.net)。

### 安装

- Fork
- 修改 `config` 文件夹下的配置文件
- 参考 `darkyzhou-blog` 分支

### 关于名称

为什么本项目叫 Blog House？其实 Blog House 指的是一个很小众的 EDM（电子舞曲） 流派，它脱胎于 French House，在 Bass 的使用上拥抱 Electro，听起来总是有一股电气打击的感觉。

不过对于 House 音乐而言，本人其实更喜欢 Deep House，它们节奏更加舒缓、意境颇为深远。这里推荐一下 Haywyre 的《Do You Don't You》。

### 致谢

自带的背景图和背景视频来自艺术家 [Friendly Robot](https://www.artstation.com/friendlyrobot)。

### 发表 issue

如果你有好的 good idea，欢迎[发表 issue](https://github.com/blog-house/blog-house/issues/new)！
