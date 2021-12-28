---
title: 绝对布局的“现代接任者”？——记 CSS Grid 布局的一个妙用
slug: one-css-grid-trick
date: 2021-03-02T00:25:29.124Z
category: 前端修炼手册
tags:
  - CSS
  - HTML
excerpt: 通过一个简单的导航栏布局问题看 CSS Grid 布局的强大作用，以及背后的 Box Alignment 规范。
---

### 顶部导航栏问题

最近笔者在编写一个静态博客的项目时，设计了这样的一个顶部导航栏：

- 左边是博客名称的几个大字，例如“Example Blog”。
- 正中间是三个导航按钮，分别为“Home”（主页）、“Articles”（文章）和“About”（关于）。
- 右边是一个切换白天/黑暗模式的按钮。

下面是这个导航栏大概的 HTML 结构：

```html
<div class="nav-container">
  <h1>Example Blog</h1>
  <nav>
    <ul>
      <li>Home</li>
      <li>Articles</li>
      <li>About</li>
    </ul>
  </nav>
  <button>🌙</button>
</div>
```

### Flexbox 可以吗

起初，我很快就想到可以使用 CSS 中的 Flexbox 来实现这个导航栏的布局，我编写了类似下面这样的 CSS：

```css
.nav-container {
  display: flex;
  justify-content: space-between;
}

/* 其他的样式省略 */
```

然而，在我打开浏览器进行调试时，我得到了下面的结果：
![](/images/uploads/one-css-grid-trick-1.png)

仔细观察中间的导航按钮，可以发现**它们并不位于容器的正中间，而是中间偏右的位置**，导致整个页面看上去有些不协调，有强迫症的人看了估计会发疯。究其原因，其实是因为`justify-content: space-between`的作用仅仅让这三个元素之间的间距相等，且`h1`和`button`贴紧容器边缘；但是由于我们的`h1`和`button`宽度并不相同，所以根据简单的几何原理就能知道，此时`nav`并不位于容器的正中间了。

看来 Flexbox 不能很好的解决我们的问题，那么我们又应该怎么办呢？

### 解决思路：绝对布局

我们很容易想到绝对布局这个强大的布局工具，我们将导航栏的 CSS 改为下面这样：

```css
.nav-container {
  position: relative;
}

.nav-container > h1 {
  position: absolute;
  left: 0;
}

.nav-container > nav {
  position: absolute;
  left: 50%;
  /* 如果不加下面这个，nav仍然不会位于正中间 */
  transform: translateX(-50%);
}

.nav-container > button {
  display: block;
  position: absolute;
  right: 0;
}
```

通过这样，我们的确能够得到想要的结果：
![](/images/uploads/one-css-grid-trick-2.png)

笔者不太喜欢这个思路，因为它使用了`transform`这样的样式，看上去有一些 tricky；同时由于`nav-container`内部的元素使用了绝对布局，浏览器会将它的高度计算为`0`，导致将这个导航栏在应用到页面上时需要额外通过`margin-bottom`或者手动指定`height`等方式才能避免`nav-container`下方的元素和它本身发生重叠。但是这些方法都具有一定的局限性，如果我很难知道导航栏内的元素的高度应该是多少怎么办？

在笔者看来，更自然的解决思路应该能够自动适应`h1`、`nav`和`button`这几个元素的高度，那么有没有这样的思路呢？

### 解决思路：Grid 布局（网格布局）

事实上，我们可以使用这样的 CSS 来解决问题：

```css
.nav-container {
  display: grid;
  grid-template-areas: 'stack';
}

.nav-container > * {
  grid-area: stack;
}

.nav-container > h1 {
  justify-self: start;
}

.nav-container > nav {
  justify-self: center;
}

.nav-container > button {
  justify-self: end;
}
```

通过这样的 CSS，我们和绝对布局一样实现了效果，但此方案的`nav-container`的高度是正常地根据子元素计算的；我们运用的属性也都是很正常、直观的布局属性。下面我们来简单地解释一下这种解决思路：

首先，我们先来看一个网格布局的例子：

```css
.some-grid-container {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
}
```

```html
<div class="some-grid-container">
  <span>A</span>
  <span>B</span>
  <span>C</span>
  <span>D</span>
  <span>E</span>
  <span>F</span>
</div>
```

在这个例子里，我们为`some-grid-container`声明了一行三个，共两行，总共六个的格子。那么 HTML 中的这六个`span`就会按照我们的`grid-template`按顺序自动被摆放到六个格子中，这是网格布局最常见的用法之一。但是很多人可能不会知道：**同一个格子其实可以放置多个元素**。我们可以给位于同一个格子的元素指定不同的`justify-self`来控制它们在格子中的相对位置，进而实现绝对布局中能够实现的类似效果。

回到前面的布局代码。首先，我们在父容器`nav-container`上使用`display: grid`将它声明为一个网格布局容器，然后使用`grid-template-area: 'stack'`将它声明为**仅仅包含一个显式声明的格子(cell)的网格布局容器**。然后我们通过`grid-area: stack;`让这些子元素都放置在同一个格子里，这样就能够使用`justify-self`来控制他们在这个格子中的相对位置了。

### Box Alignment

上面的解释看上去太过简单，我们下面来深入理解一下这种做法背后的 CSS 原理。理解上面做法的关键在于理解`justify-self`和所谓的“格子”背后的 CSS 规范。对于 Flexbox 和 Grid Layout 这样的布局方法来说，关于子元素如何在应用了这两种布局方法的父容器里对齐，其实是有一套叫做 [CSS Box Alignment](https://drafts.csswg.org/css-align/) 的规范的。对于被对齐的子元素来说，规范定义了三种对齐方法：

1. Positional alignment（按位置对齐）：像`start`、`end`、`center`这样的关键字所指定的。
2. Baseline alignment（按基线对齐）：如`baseline`、`last bastline`和`first baseline`。
3. Distributed alignment（按分布对齐）：包括`space-between`和`space-around`。

以及下图所示的六种属性，图片来自于上述规范。

![](/images/uploads/one-css-grid-trick-3.png)

结合前面的例子，在应用了网格布局的`nav-container`里，我们创建的每个格子其实就是一个所谓的“对齐上下文”。对于`justify-self`来说，它可以控制子元素在上下文里在 Inline Axis（通常，你可以理解为“横轴”）上的对齐位置。它的默认值和`stretch`的效果类似，让子元素尽量伸展以占据上下文的全部空间。但它也有`start`、`end`和`center`这样的可选值，效果正如我们在上面的解决方案里看到的那样。

如果想了解有关 Box alignment 的更多内容，这里有一份 Cheat sheet：https://rachelandrew.co.uk/css/cheatsheets/box-alignment，简明扼要地展示了Flexbox和Grid Layout 中各个对齐属性以及值的区别。

### smolcss.dev 里的例子

我们在上面的解决思路中的做法其实在 [smolcss.dev](https://smolcss.dev) 里也有[介绍](https://smolcss.dev/#smol-stack-layout)：

![](/images/uploads/one-css-grid-trick-4.png)

在上面的例子里，中间的文字使用了下面的样式（有删减）：

```css
.smol-stack-layout h3 {
  /*
  这是align-self和justify-self的缩写属性
  通过这样来确保文字处于父容器提供的格子的正中间
  */
  place-self: center;
  grid-area: stack;
}
```

左下角的文字使用了下面的样式（有删减）：

```css
.smol-stack-layout small {
  /*
  align-self对应在Block axis（在这里是纵轴）上的对齐方式
  */
  align-self: end;
  justify-self: start;
}
```

### 美中不足：元素重叠问题

虽然我们的网格布局方案看上去很简洁、很方便。然而，它和前面的绝对布局方案都有一个潜在的问题：**在容器宽度小到一定程度之后，元素之间会出现相互重叠的问题**，如下图所示：

![](/images/uploads/one-css-grid-trick-7.png)

解决方案需要结合实际情况去考虑，对于这个导航栏的使用场景来说，应该结合一个媒体查询在宽度较小时显示收缩版的导航栏，比如说将导航按钮和白天/黑夜模式的切换按钮收到一个汉堡包组件中。

### 浏览器兼容性

以下是 [Can I Use](https://caniuse.com/) 上对本文章讲到的`grid-template-area`和`grid-area`属性的兼容性概览：

![](/images/uploads/one-css-grid-trick-5.png)

![](/images/uploads/one-css-grid-trick-6.png)

可以看到，这两个属性在现代浏览器中已经有着非常广泛的兼容性，右上角显示全球超过92%的浏览器用户都能够享受到这两个属性带来的便利。当然，并不包括 IE。如果有需要的可以考虑使用前面的绝对布局方法作为专供 IE 的替代方案。

### 总结

网格布局的这种做法其实在笔者阅读的很多大牛的博客里都有提及，被称为是绝对布局的“现代接替者”。我们通过一个简单的导航栏的例子看到了网格布局蕴含的巨大潜力，笔者也将继续努力发掘、探索网格布局的精妙用法，让网格布局助力前端开发者技术栈的不断升级！

### Reference

- https://rachelandrew.co.uk/css/cheatsheets/box-alignment
- https://smolcss.dev/#smol-stack-layout
- https://drafts.csswg.org/css-align/
