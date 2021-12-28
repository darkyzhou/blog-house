---
title: Blog House 自动图片优化测试
date: 2021-12-28
category: 测试
tags:
  - 测试测试测试
---

下面的图片的 Markdown 源码是：

```
![alt text](/images/uploads/avatar.jpg)
```

![alt text](/images/uploads/avatar.jpg)

但实际上它自动地被 Blog House 转换成了三种图片格式，并使用 `<picture>` 元素进行加载。
