---
title: 从 package.json 和 package-lock.json 浅谈 npm 解析依赖出错问题
slug: package-json-and-package-lock-json
date: 2020-06-26T03:01:52.123Z
category: 前端修炼手册
tags:
  - NodeJS
  - npm
---

### 引子

在 Node.js 的世界中，人们几乎每天都在使用着 `npm install` 命令。这个命令会根据 `package.json` 的内容，将项目所依赖的库安装到本地的 `node_modules` 文件中，然后产生一个新文件 `package-lock.json`。

许多人都知道，后者的作用是保存 npm 按照 `package.json` 的内容经过计算而构建的*依赖树*，对应本地的 `node_modules` 的文件结构。并且，之后执行的 `npm install` 都将围绕这棵依赖树进行。从某种意义上来说，`package.json` 就像是构建本地依赖树的蓝图。

关于 `package-lock.json` 有一种广泛流传的观点是：在共享给他人的项目中，应该提供它来确保其他人通过 `npm install` 所获得的的 `node_modules` 和原作者的*保持一致*，从而确保不会出现依赖的版本出错而导致配置本地开发环境失败。

然而有些时候，我们仍然会在使用 `npm install` 之后出乎预料地遇到了依赖版本出错的问题；或是在团队开发中偶然发现自己执行 `npm install` 之后， `package-lock.json` 的内容竟然发生了改变，旋即犹豫不决：为什么发生这种问题呢？要不要恢复到 HEAD 中的版本呢？

别着急，本篇文章就来讲讲 `package.json` 与 `package-lock.json` 的关系，为你解决上述问题提供思路！

### 语义化版本

在讲述它们的关系之前，我们有必要先来理解一下 [Sematic Versioning](https://semver.org/lang/zh-CN/) (简称 SemVer，中文名为“语义化版本”) 规范。它被选为 npm 社区的首选版本规范，npm 上绝大多数的依赖库都采用了这种版本规范。

以语义化版本号 `X.Y.Z` 为例：

- `X` 是 Major version，表示一次*不向后兼容*的变更，例如 API 的变更。
- `Y` 是 Minor version，表示一次*向后兼容*的变更，通常是添加一些新功能。
- `Z` 是 Patch version，表示一次*向后兼容*的 Bug 修复，或者是文档的修改。

我们再来看看 `package.json` 中对语义化版本的使用：

```json
"dependencies": {
  "@angular/common": "^9.1.0",
  "rxjs": "~6.5.4",
  "@nrwl/angular": "9.4.5",
}
```

上面的例子中：

- `^` 在 npm 眼里表示“安装这个库最新的 Minor version 或 Patch version，但 Major version 保持不变。”。所以对于 `^9.1.0`来说，这份 `package.json` 的用户如果运行 `npm install`，是完全可能在实际上安装了 `9.2.0` 版本的，这会体现在他的 `package-lock.json` 中。
- `~` 在 npm 眼里表示“安装最新的 Patch version，但其他必须不变”。与上面类似，`~6.5.4` 说明只允许安装 `6.5.4`、`6.5.6` 这样的版本。
- 如果版本号前既没有 `^` 也没有 `~`，则说明 npm 必须安装*完全一致*的版本。

在开发者使用 `npm install <dep_name>` 来安装依赖时，npm 默认会在 `package.json` 中写入前面带 `^` 的版本号。因为 npm 认为，既然 SemVer 被选为了首选的版本规范，那么这些库的开发者们都应该严格地遵循它，不应该在 Minor version 和 Patch version 中引入*不向后兼容*的变化，默认使用 `^` 还能在最大程度上保证使用者安装的依赖的版本是最新的。基于以上原因，大多数的 npm 项目的 `package.json` 里的版本号都是 `^X.Y.Z` 形式的。

然而，npm 这样的假设在实际中是存在隐患的。我们先按下不表。

### package.json 与 package-lock.json

基于上述的假设，`npm install` 会同时参考 `package.json` 和 `package-lock.json`，并确保两者表示的依赖的版本能够符合上述的规则。下面用一个例子来阐释 `npm install` 的行为：

假设你 clone 了 A 项目，A 项目的 `package.json` 的依赖部分如下：

```json
"dependencies": {
  "a": "^1.1.0",
  "b": "~2.2.0",
  "c": "3.3.0",
}
```

在 A 项目提供的 `package-lock.json` 中，三个依赖的版本解析结果分别为 `1.2.4`、`2.2.4` 和 `3.3.0`。那么你在运行 `npm install` 后将会得到一模一样的解析结果。这里 npm 遵循了 `package-lock.json` 的结果。

然而，如果 A 项目的作者通过 `npm install xxx` 安装新的依赖，而忘记 commit 更新后的 `package-lock.json`，那么这会导致提供给用户的 `package-lock.json` 存在偏差，比如 `a` 依赖的版本不是 `1.2.4` 而是 `1.0.4`。你在运行 `npm install` 后，`package-lock.json` 将会被修改，其中的 `1.0.4` 所在的节点会被修改为你的 `npm` 的解析结果，即最新的、可以满足 `^1.1.0` 规则的 `1.2.4`。这里 npm 遵循了 `package.json` 的规定。

### 更新 package-lock.json 的隐患

如上文所说，`npm install` 可能会自动更新本地已经存在的 `package-json.json`。同样使用依赖 A 的例子，这里的隐患是：如果这个依赖 A 没有很好地遵守 SemVer，或者是因为代码规模太大而出现疏忽（这非常常见），导致 `1.3.1` 中出现了不兼容 `1.2.0` 的代码部分，会如何呢？对，你将无法正常运行 clone 下来的项目。因此如果你在运行 `npm install` 之后，`package-lock.json` 发生了改变，你应该警觉这一个可能性。

`npm` 为了缓解这个问题，实际上专门引入了一个特殊版本的 `install`，叫做 `clean-install`，简写 `ci`。它在进行 `npm install` 所做的工作时，会检查一些条件，如果解析 `package.json` 的结果与已存在的 `package-lock.json` 不符，那么它将报错退出，同时若本地已经存在 `node_modules`，它将事先删除。

但 `npm ci` 并没有彻底解决这个问题，它只是防止产生可能有误的 `package-lock.json`。如果我们的项目是发布到各大 registry 上被人们使用 `npm install xxx` 安装的，那么我们的用户的 npm 是不会遵守我们的 `package-lock.json`的（这是设定，用户的 npm 只会遵守它的项目本身的 `package-lock.json`）， 那么我们又该如何去从避免用户的 npm 解析出不同的依赖树呢？

有人提出：不要使用 `^`，甚至是 `~` 也不要使用，定死尽可能多的依赖的版本号，这样就能在最大程度上杜绝上述隐患。定死版本号虽然能够缓解隐患，但也带来了这样的问题：用户再也不能通过 `npm install` 来自动更新那些进行了 bug 修复的依赖，使得你必须及时更新使用了新依赖的新版本，但依然造成了不便。

### 解决思路

笔者综合一些参考资料，认为：我们不应该一律采用 `^` 规则，而应该根据实际情况，灵活地定义版本规则。我们来看看 `nx workspace` 给开发者自动生成的 `package.json`（略去了一些项目）：

```json
"dependencies": {
    "@angular/animations": "^9.1.0",
    "@angular/common": "^9.1.0",
    "@nrwl/angular": "9.4.5",
    "rxjs": "~6.5.4",
    "zone.js": "^0.10.2"
  },
  "devDependencies": {
    "@angular/cli": "9.1.0",
    "@nrwl/workspace": "9.4.5",
    "@types/node": "~8.9.4",
    "dotenv": "6.2.0",
    "ts-node": "~7.0.0",
    "tslint": "~6.0.0",
    "typescript": "~3.8.3",
    "@angular/compiler-cli": "^9.1.0",
    "@angular-devkit/build-angular": "0.901.0",
    "codelyzer": "~5.0.1",
    "@types/jest": "25.1.4",
    "ts-jest": "25.2.1"
  }
```

`nx workspace` 会给用户生成这样的 `package.json`，然后调用用户的 `npm` 进行 `npm install` 产生 `package-lock.json`。这一过程和上面讨论的用户使用 `npm install xxx` 安装你的库几乎一致。

我们可以看到，上面的片段混用了 `^`、`~` 规则和固定版本号。这样做有以下的好处：

1. 能够兼容那些不遵从 SemVer 的依赖。例如 TypeScript，它特别喜欢把 SemVer 中的 Minor version 当做 Major version 来使用，经常会出现 `3.x.y` 不兼容 `3.(x-1).z` 的问题。所以 `nx workspace` 就限定了 `~3.8.3`，因为 TypeScript 暂时还保留些许克制，不会在 Patch version 中引入*不向后兼容*的改变。
2. 缩小用户进行 `npm install` 后产生错误的依赖树的排错范围。我们能够知道哪些依赖严格遵从 SemVer，所以能够套用 `^` 和 `~` 规则；也能知道哪些项目规模庞大，大到哪怕是 Patch version 的更新都可能会无意中导致不兼容的改变，从而使用固定版本号······总之我们可以根据自己的需求，灵活地套用规则。这样我们就能够将可能发生错误的隐患限制到了一个非常小的范围，易于排查。

当然，对于规模尚小的项目而言，全部采用 `^` 规则几乎不会出现差错，但是当你的用户向你发出 Issue 时，你就是时候要检查一下自己的 `package.json` 和 `package-lock.json` 了。

### 参考资料

- https://semver.org/lang/zh-CN/
- https://dev.to/saurabhdaware/but-what-the-hell-is-package-lock-json-b04
- https://docs.npmjs.com/cli/ci
- https://dev.to/zkat/comment/epbj
