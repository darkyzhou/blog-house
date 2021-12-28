---
title: 记一次对 CSS FlexBox 的误用
slug: mistake-on-using-flexbox
date: 2020-09-04T20:12:10.123Z
category: 前端修炼手册
tags:
  - CSS
  - Flexbox
---

### 问题的介绍

最近开发某反馈系统的前端，偶然发现顶部导航栏的高度在 MacOS 或 iOS 下的 Safari 中计算异常：

![](/images/uploads/mistake-on-using-flexbox-1.png)

首页的布局以及相关的样式大体如下：

```html
<div class="rootContainer">
  <nav class="navBar"></nav>
  <div class="mainContainer"></div>
</div>
```

```scss
.rootContainer {
  display: flex;
  flex-direction: column;

  .navBar {
    flex: 0;
    padding: 8px 0;
  }

  .mainContainer {
    flex: 1 1 auto;
  }
}
```

这里 `rootContainer` 使用了 FlexBox 布局，使得顶部导航栏在固定高度的情况下，下面的主体容器能够自动将高度扩展直到占满视口的剩余高度。

然而，在 Safari 中，顶部的导航栏的实际高度为 `16px`（上下 padding 之和），而不是 Chrome / Firefox 中正常的 `40px`（padding 的 `16px` 以及其中的内容高度 `24px`）。

### 问题的解决

仔细查找资料发现，问题出在导航栏样式中的 `flex: 0`。`flex` 属性在仅给定单个值时，会将 `flex-grow` 属性设置为给定的值，并将 `flex-shrink` 和 `flex-basis` 分别设置为默认值 `1` 和 `0`，因此 `flex: 0` 等价于 `flex: 0 1 0%`。然而，正如我们在上文看到的，这种赋值方式在 Safari 中会出现让人意想不到的情况。

其实从根本上来说， `flex: 0` 的使用是自相矛盾的，因为 `flex-grow: 0` 表明此元素不参与伸长，而`flex-shrink: 1`却又表明此元素参与缩小，但 `flex-basis: 0` 又表明此元素在不参与伸长时的高度（或宽度）应该为 `0`。这样我们也就不难理解为什么 `flex: 0` 在 Chrome 和 Safari 中存在如此之大的差别了。

综上所述，问题的根源在于 `flex: 0` 的使用不合理，应该修改为 `flex: none`。

下面列举一些 flexbox 常用的赋值缩写：

```css
/* 等价于 flex: 0 0 auto */
flex: none;
/* 等价于 flex: 1 1 0% */
flex: 1;
/* 等价于 flex: 2 2 0% */
flex: 2 2;
```
