---
title: 关于
hidden: true
---

### 项目简介

[Blog House](https://github.com/darkyzhou/blog-house) 是一个基于 Web 前端框架 [Sapper](https://sapper.svelte.dev/) 的静态博客生成器，后者基于 [Svelte](https://svelte.dev/) 。
除此之外，Blog House 还使用了 [Tailwind CSS](https://tailwindcss.com/) 框架，简化了开发流程，同时结合 PurgeCSS 的使用，降低了构建产物的体积。

为了提供完善的博客功能、提升用户体验，Blog House 还使用了 [Algolia](https://www.algolia.com/) ，带来了方便快捷的文章、标签搜索、排序功能。

### 特色

1. 编译速度快，产物体积小。Svelte 项目的编译产物仅包含框架自身的一些工具代码，并不像 React、Vue 等流行的框架那样还包含体积庞大的框架运行时。
2. 源代码结构简单，高度可自定义。Blog House 的源码文件夹结构类似于著名的 Next.js 框架，使用 `routes` 文件夹下的各个源文件来表示网页路由；使用 `components` 文件夹存放各种可复用的组件源文件。
3. 自带的主题含有功能完整的各种页面。例如包含悬浮大纲栏目、评论功能的文章页，以及含有搜索、排序功能的文章列表页。
