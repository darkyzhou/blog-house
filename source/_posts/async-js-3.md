---
title: 浅谈 JavaScript 异步编程（三）：JS 异步编程的发展
slug: async-js-3
date: 2020-04-26T11:12:25.123Z
category: 前端修炼手册
tags:
  - 异步编程
---

## 混乱的 Callback

正如先前所述，JS 运行环境在处理收到的任务之后，主要是通过 Callback 来通知 JS 这个“大老板”的。Callback 本质上是一个接受若干参数的函数。

在 Promise 还未出现的年代，人们只是在“要有 Callback”上达成了广泛共识，并没有在“Callback 应该需要什么参数”、“Callback 应该什么时候调用、怎么调用”这类细节问题上形成统一的标准。并且，从形式上看，Callback 是一个作为参数的函数，如果出现复杂的异步任务，人们很容易写出嵌套的 Callback，既不美观，又影响了程序员的思维。同时，Callback Hell 的产生又让人们伤透了脑筋。

![](/images/uploads/async-js-3-1.png)

对于一些复杂的异步任务，人们很容易写出像上图这样糟糕的代码。这种层层嵌套的 Callback 又被成为 Callback Hell。

Callback Hell 不仅难以阅读，更为严重的是它能够打乱程序员对于复杂的异步任务的思维流。Callback 天生就不符合人脑的“顺序思考”特性，而 Callback Hell 则有过之而无不及，大大增加了人在这段代码中犯下低级错误的可能性，为系统的稳定带来风险。

与此同时，几乎每一个广泛使用的库或者其他 API 对自己异步操作的 Callback 都有着不同的设计。这些各自不同的设计让当时的人们很是痛苦，每用一个 API 就要去查一查参数、异常处理等细节的文档。看看下面这几个常见的异步 API 到底使用了多少种不同的设计方案：

![](/images/uploads/async-js-3-2.png)

缺乏细节而又容易产生问题的几个例子：

1. 异步任务会存在哪些状态？
2. 什么时候调用错误处理 Callback？调用几次？什么参数？
3. 在操作成功后是不是马上调用 Callback？
4. 传入 Callback 的参数会不会因情况而异？

在这个例子中，我们的程序要在运货 API 检查到缺货并抛出错误时，给已经付款的用户退款 1000 美元；在检查到货品充足时给用户显示成功信息。

![](/images/uploads/async-js-3-3.png)

可是，我们没有想到的是，运货 API 检查缺货的过程中会同时进行很多小步骤，而每一个小步骤出错都可以导致这个 Callback 被调用，也就是说这个 Callback 可能会被用异常对象调用多次，你会给用户多退款好几千美元！

像这样的问题被称为**信赖问题**。在这种问题中，你很难保证 Callback 会 100%按照你设想的方式被调用。因为这些多样的 API 对于如何对待你的异步操作并不存在一种**统一**的规范。

## 正规军 Promise

Callback 标准的混乱问题源于当时 JS 的标准并没有在这一领域带来某种官方认可的规范，于是第三方各自为战。Callback 自身的缺陷使得它无法适应正在变得越来越复杂的异步任务，最终导致了 Callback Hell 的肆虐。

事情终于在 2015 年迎来转机。JS 的标准制定者们综合了全世界范围内的反馈后，终于在 ES6 标准中正式推出了官方的异步编程 API——Promise API。

Promise 是**异步操作的抽象封装**，它对这些异步操作进行了合理的限制，在很大程度上缓解了信任问题，因为所有的行为变得可预测、可控制起来。Promise 正如其名，是 JavaScript 官方给与我们的异步编程的“承诺”。

让我们来好好地认识一下这个 JS 异步编程的“正规军”有什么特点吧：

- 一个 Promise 实例一旦被创建，异步操作就开始进行，不能中止。
- Promise 在创建后的任意时间点上只能存在以下三种状态的其中一种：

  1. Pending（进行中）
  2. Fulfilled（操作成功）
  3. Rejected（操作失败）

  并且，这三种状态间的转换关系是单向的，不可逆的。

当 Promise 处于 Fulfilled 或 Rejected 状态时，我们说这个 Promise 已经决议（resolved），而且一旦决议则永不改变。

现在我们知道：Promise 代表的异步操作要么顺利完成，要么因为错误而失败，绝不存在模棱两可的状态。而且，状态的不可逆，又使得 Promise 摆脱了修复、重试动作带来的复杂性。若要在一个 Promise 失败后重试异步操作，只能重新构造一个 Promise 实例。

这样的设计很好地缓解了异步 API 的信赖问题，因为当这些 API 都采用 Promise API 之后，我们在处理这些 Promise 的方式上就能获得统一性，从而让我们得以将宝贵的注意力集中在我们真正需要关心的部分——具体的业务数据上。

![](/images/uploads/async-js-3-4.png)

## Promise Chain

Promise API 除了 Promise 的理念外，还引入了功能强大的 Promise Chain。下图就是先前的 Callback Hell 例子用 Promise 改写后的版本（假定 fs 库支持 Promise）。这里，每一个 then 函数的参数都是一个接受上一个 Promise 的结果，产生下一个 Promise 的函数。也就是说，我们能通过 Promise Chain 将一系列复杂的异步操作用 Promise 表达，并将它们串联起来构成一个可读性极佳的整体，成功地摆脱了 Callback Hell！

![Promise Chain 的例子](/images/uploads/async-js-3-5.png)

`then` 函数也接受第二个参数用于处理上一个 Promise 的错误，默认抛给下一个 then 函数。`catch` 函数是一个特殊的 `then` 函数，它只接受处理错误的函数。

## 受到广泛应用的 Promise API

自从 Promise API 正式推出以后，各大异步 API 以及浏览器的许多 API 都跟进了对 Promise 的支持。在 2020 年的今天，我们能接触到的绝大多数与异步操作相关的 API 都提供了对 Promise API 的支持（除了 Node.js 的官方库之外）。

![浏览器中新推出的用以取代老旧的 XMLHttpRequest API 的 Fetch API](/images/uploads/async-js-3-6.png)

![ES2020 标准中引入的 Dynamic Import](/images/uploads/async-js-3-7.png)

## Promise API 的不足

Promise API 并非完美无瑕。虽然 Promise Chain 让复杂的异步操作代码的可读性大大提高，但其实并没有从本质上解决 Callback 模式的一大核心痛点：不符合人脑的“同步思维”。人脑习惯于以时间先后顺序连贯地思考一系列复杂的操作，但无论是 Callback 还是 Promise Chain，都在某种程度上打断了思维的连贯性。

![在“先”与“后”之间始终存在着阻隔思维流的代码](/images/uploads/async-js-3-8.png)

## 后起之秀 async/await

我们看来还是习惯于平常编写的同步式的代码。要算一个平方并输出，我就先 `let square`，再 `square = getXXX()`，然后 `console.log(square)` 就好了，这很符合我的思维习惯。于是有人利用 ES6 标准中引入的 Generator，实现了用同步式的代码去表达 Promise Chain！

![](/images/uploads/async-js-3-9.png)

`function` 后的星号表示这是一个 Generator，而 `yield` 表示产出后面的 Promise。Generator 在执行到 `yield` 并产出值之后就会暂停执行，直到外部调用 `next()` 才能恢复执行，直到下一个 `yield`，由此往复直到末尾。

![](/images/uploads/async-js-3-10.png)

要运行这个 Generator，需要借助一个特殊的函数的帮助：它会自动处理通过 `yield` 产出的 Promise，并将 Promise 的结果用 `next()` 塞回去，然后 Generator 继续运行到下一个 `yield xxx`，直至末尾。

通过和特殊函数的“一唱一和”，我们顺利实现了用同步式的代码表达 Promise Chain。不过最终的代码看上去很别扭，而且还得额外写出这个特殊的函数，还是有些麻烦。

好消息是，这种创造性的用法马上就被列入到了 ES7 标准当中，那个特殊的函数已经被纳入了 JavaScript 的引擎之中，不必再额外写上。并且，为了改善可读性，ES7 还专门增加了两个关键字：`async` 和 `await`。让我们用 async/await 重构上面的例子（仅是示例，fs api 至今不支持 async/await）：

![](/images/uploads/async-js-3-11.png)

如今 async/await 在 JavaScript 的各大运行环境中都有了广泛的支持。

## 展望未来

人们对于 JavaScript 异步编程的探索仍在继续。自 async/await 被列入标准后，人们陆续又提出了诸如 Async Iteration 这些让编写异步代码更加方便的概念。

![一个 Async Iteration 的用例，需要实现 Async Iterator 或 Async Generator](/images/uploads/async-js-3-12.png)

## 小结

JavaScript 异步编程在经历了混沌的 Callback 时代后终于迎来了 Promise API 的曙光，现如今，我们几乎能在 JS 的一切使用场景中看到 Promise 的身影，如 `then()` 等字眼。

变得越来越强大的 JavaScript 也在这段时期促进了前端的工程化、前后端的语言统一以及伟大的前后端分离战略等，其中当然也少不了这些异步 API 的功劳。

接下来我们来研究一下 JS 异步编程的另一种思路——响应式编程。

## 链接

- [浅谈 JavaScript 异步编程：前言](/articles/async-js)
- [浅谈 JavaScript 异步编程（一）：JS 异步编程的含义](/articles/async-js-1)
- [浅谈 JavaScript 异步编程（二）：JS 异步编程的基石](/articles/async-js-2)
- **[浅谈 JavaScript 异步编程（三）：JS 异步编程的发展](/articles/async-js-3)**
- [浅谈 JavaScript 异步编程（四）：JS 异步编程的另一种思路](/articles/async-js-4)
