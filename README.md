<p align="center">
  <img width="300" src="https://github.com/blog-house/blog-house/raw/master/logo.png" alt="Blog house logo">
</p>
<h2 align="center">Blog House</h2>
<p align="center">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/blog-house/blog-house">
  <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/blog-house/blog-house">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/blog-house/blog-house?style=social">
  <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/blog-house/blog-house">
</p>

### 简介

[Blog House](https://github.com/blog-house/blog-house) 是一个基于 Web 前端框架 [Sapper](https://sapper.svelte.dev/) 的静态博客生成器，后者基于 [Svelte](https://svelte.dev/) 。
除此之外，Blog House 还使用了 [Tailwind CSS](https://tailwindcss.com/) 框架，简化了样式代码的复杂度，同时结合 PurgeCSS 的使用，降低了构建产物的体积。

为了提供完善的博客功能、提升用户体验，Blog House 还使用了 [Lunr](https://lunrjs.com/) 和 [Netlify CMS](https://www.netlifycms.org/) 框架，不仅带来了方便快捷的文章、标签搜索功能，还提供了功能强大的在线 Markdown 文章编辑器。
Blog House 还使用 [Utterances](https://utteranc.es/) 给文章和页面带来了基于 Github Issues 的评论区功能，用户的访客只需要登录 Github 即可发表评论。
除此之外，Blog House 还提供了基本的 SEO 优化。

### 特色

1. 编译速度快，产物体积小。Svelte 项目的编译产物仅包含框架自身的一些工具代码，并不像 React、Vue 等流行的框架那样还包含体积庞大的框架运行时。
2. 源代码结构简单，高度可自定义。它使用 `routes` 文件夹下的各个源文件来表示网页路由、使用 `components` 文件夹存放各种可复用的组件源文件、使用 `source` 存放所有文章、页面的源 Markdown 文件。
3. 配置简单。用户只需 fork 本仓库，然后 clone 到本地，再运行初始化脚本即可进行交互式配置。整个过程十分钟之内就能完成。
4. 自带的主题含有功能完整的各种页面。例如包含悬浮大纲栏目、评论功能的文章页，以及含有搜索、排序功能的文章列表页。
5. 自带 Netlify CMS，用户只需使用浏览器打开它，就能在线编写、修改文章和页面，保存的修改会由 Netlify 的 Bot 自动更新到 Github 仓库中，同时借助 Github Actions 的帮助运行构建，在数分钟之内上线修改。整个过程不需要用户手动操作。
6. 自带基本的 SEO 优化，例如 `name` 和 `description` 的 meta tag、自动生成的 Sitemap、内置 Google Analytics 和百度统计支持。
7. 自带评论区功能，基于 Utterances 实现，用户的访客只需要登录 Github 即可发表评论，同时这些评论由于是对应于 Issue 的评论，可以被引用、保存。
8. 自带搜索功能，基于 Lunr 实现，用户可以使用各种关键词搜索文章、页面和标签。此功能基于每次构建之后生成的静态索引文件，不需要依赖第三方的服务器实现。

### Demo

请见作者的个人博客：[Darky's Blog](https://darkyzhou.net)。

### 安装

请见 Wiki 中的[安装方法](https://github.com/blog-house/blog-house/wiki/%E5%AE%89%E8%A3%85%E6%96%B9%E6%B3%95)。

### Roadmap

目前，Blog house 仍处于早期阶段，还有许多有用的功能没有来得及实现：

| 功能                      | 完成情况 |
| ------------------------- | -------- |
| 文章列表页面左侧的时间轴  | 🚧 工作中 |
| 文章页面点击图片放大      | 🚧 工作中 |
| 支持 RSS                  | 🚧 工作中 |
| 使用 Netlify CMS 管理图标 | 🚧 工作中 |
| 文章页分页                | 📅 计划中 |
| 文章分类（Category）      | 📅 计划中 |

如果你有好的Good idea，欢迎发表 Issue！

