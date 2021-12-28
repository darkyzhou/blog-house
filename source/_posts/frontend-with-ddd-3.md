---
title: 探究 DDD 在前端开发中的应用（三）：探究 DDD 在前端开发中的应用
slug: frontend-with-ddd-3
date: 2020-07-31T23:14:54.123Z
category: 前端修炼手册
tags:
  - DDD
  - Angular
---

## 前端之于 DDD

无论是 SSR 还是 SPA，结合上文讨论的 DDD 基础概念我们可以发现，从整个 DDD 软件的结构上看，前端主要处于 Presentation 层。也就是说，前端的主要任务是显示业务数据，并且支持用户交互动作，绝大多数的业务逻辑其实存在于服务端的 Domain 层中。当然前端有时候会存在一些业务逻辑，但它们大多都是服务于或者同构于服务端的，例如某些验证逻辑。不过总的来说，DDD 的重点，Domain 层位于服务端，而不是前端。

不过，这并不意味着 DDD 在前端就没有任何应用的空间。在 SPA 项目的职责不断变多、规模不断壮大，复杂程度不断提高的今天，DDD 奉行的一些理念以及倡导的一些范式依然能够在前端中派上用场。事实上，已经有一些先驱者为我们探索了 DDD 在 SPA 项目中的应用。

他们认为在 SPA 中，我们依然有理由去构筑一个 Domain 层，其中含有与服务端通信的数据模型，以及某些前端必要的业务逻辑，还有一些数据的验证逻辑等。我们可以在 SPA 中实现一个“残血版”的 DDD。下面，我们将探讨 Manfred Steyer 的利用 Angular 和 Nx Workspace 实现的 DDD，他为此特地编著了《Enterprise Angular》，电子版可以在网上免费下载。

## Angular & Nx 简介

本节讨论的 Angular 是指由 Google 推出的 MVVM 框架 Angular 2，它使用 TypeScript 编写。虽然在全球范围内的人气不及 React 和 Vue 等竞品，甚至在国内都近乎无人问津（不过，中大教务系统却是使用它开发的）。但 Angular 依然凭借它的特色获得了大批程序员的好评。

它主要有两大特色：一是引入了一套依赖注入（Dependency Injection）系统，让代码块的复用变得更为简单；二是将组件分为模板（Template）、组件类（Component）、样式三个部分，分别对应.html、.ts、.css（或.scss 等）文件。

Nx 是由 Angular 开发组和前 Google 职员组成的组织 Nrwl 共同开发的，旨在为前端程序员提供一个打造 Monorepo 的工具箱。

## Nx Workspace

Nx Workspace 为 Angular 开发者提供了一个开箱即用的 Monorepo 构建工具，它使用 Library 的概念来分割代码组件，强调不同的 app 可以复用组件以提升开发效率，减少重复代码。例如，对于一个预定机票的网页 App 项目，要求同时提供客户端和管理端，那么它的软件架构可能是这样的：

![](/images/uploads/frontend-with-ddd-3-16.png)
客户端 App 和管理端 App 分别利用了一个共享的 Library 和一个独享的 Library

## Nx Workspace + DDD

Manfred Steyer 提出，我们可以使用 Nx Workspace 中的 Library 来组成 DDD 中的限界上下文。常用的几种 Library 的类型：

- domain：含有业务数据模型，以及一些业务逻辑，数据验证等。
- feature：负责用例的实现的 Smart Component。
- ui：提供与实际用例无关的、可复用的 Dumb Component。
- util：提供以下状态无关的服务、管道或者一些纯函数。
- shell：这个限界上下文的入口 Library，负责路由等。

Manfred 同时强调，这些 Library 的逻辑层级存在区别，因而要严格控制它们之间的依赖关系。请看下面的例子，图中的箭头表示依赖关系。从 UI 相关代码的逻辑分层看，位于最高层的是 feature library，而像 util library 这样的则处于低层级。feature library 中的 Smart Component 是用户直接看到的组件，而 data-access 和 util library 中的代码则是被 feature library 依赖，但前者不能反过来依赖后者。这种依赖规则可以通过 Nx Workspace 提供的 library 依赖 lint 规则来实现，具体因篇幅有限不做阐释。

![](/images/uploads/frontend-with-ddd-3-17.png)
图片来自 Manfred 的《Enterprise Angular》

## Domain Library

在数据层面上，feature library 会依赖 domain library 中供给的数据模型，以及验证逻辑等，而 domain library 则是整个前端软件中直接与服务端相连接的层级。这样的分层关系符合 DDD 中的要求，并且也契合了 DDD 中的以业务需求为中心的理念。下面，我们来仔细研究一下 domain library。

Domain library 中包含三个层面的代码，分别是 Application、Domain 和 Infrastructure。其中的 Domain 就是 DDD 中的 Domain 层，内含 Entity，存有数据模型，以及前端需要的部分业务逻辑。

![](/images/uploads/frontend-with-ddd-3-18.png)
图片来自 Manfred 的《Enterprise Angular》

下图是 Manfred 给出的 Domain 层的聚合例子，可以看到它和前面介绍 DDD 时给出的聚合例子几乎相同。这里再强调一下，DDD 抵触那些只有数据模型的实体类，并将它们成为「贫血领域模型」。有了 Domain 层的这些实体类之后，不要忘记我们正在编写前端代码，所以接下来我们要思考的是如何让我们的组件与服务端沟通，接收并显示数据。让我们来看看 Application 层中的 Facade。

![](/images/uploads/frontend-with-ddd-3-19.png)
代码来自 Manfred 的《Enterprise Angular》

严格来说，Facade 并不属于 DDD 的内容，但却是一个在 Angular 圈子里比较流行的实践，相当契合 DDD，有着以下优势：

- 封装复杂的数据逻辑
- 负责状态管理
- 简化 API

而 BehaviorSubject 是 RxJS 中的概念，它可以存储数据，并通过订阅者模式向订阅了这个 Facade 数据的组件推送数据。

![](/images/uploads/frontend-with-ddd-3-20.png)
代码来自 Manfred 的《Enterprise Angular》

有了 Facade 和实体类之后，我们其实同时也实现了 DDD 中的领域事件：我们借助了 RxJS 的 Observable 实现了一个前端的消息机制。如下图所示，我们的组件通过对 Observable 进行 subscribe，让它得以在数据发送改变的时候收到最新的数据。

![](/images/uploads/frontend-with-ddd-3-21.png)

一般来说，同一个限界上下文的 Domain 层仅为当前限界上下文的 feature library 服务。如果需要跨限界上下文的领域事件，可以另外使用一些消息机制实现，例如一些简单的事件发布/订阅库。至于 Infrastructure 层则比较简单，其中的各种代码只是对服务端提供的接口的 XHR 调用进行了简单的封装。

## Nx Workspace + DDD 实例

接下来我们来看看一个实际项目的例子，取自 Matrix 即将上线的新版反馈系统。代码写于本人学习 DDD 的早期，对 DDD 的概念还不算熟练的时期，所以其中存在在一些瑕疵，我会在讲解时指出并给出符合 DDD 的修改方法，如果你有不同的意见，欢迎指出并讨论。我将在讲述 Library 时使用通知页面对应的限界上下文作为例子。

![](/images/uploads/frontend-with-ddd-3-22.png)
反馈系统的通知页面

为了使用 Nx Workspace 以及 DDD 来实现这样的一个反馈系统，我设计了如左图所示的几个限界上下文。其中通知页面的限界上下文中含有四个 library，形成的依赖关系图如下图所示。这里 feedback、notification 等限界上下文和服务端的限界上下文的划分是一致的。只不过服务端的 domain 层之外还存在有持久化层等。

![](/images/uploads/frontend-with-ddd-3-23.png)
右边是这些 Library 形成的逻辑层级，箭头表示依赖关系，可以看到在 notification 限界上下文中我们得到了一个清晰的 Library 的依赖关系，这将有利于我们区分代码职责，以及后续的维护。

下图是 domain library 中的 notification.entity.ts 和 update-notification-status.facade.ts。

![](/images/uploads/frontend-with-ddd-3-24.png)
我在 Notification 实体类中还引入了 class-transformer 包的修饰器，它可以自动将服务端传来的 string 类型的 time 转换为 Date 类。

下图是通知列表组件类，可以看到它是如何通过 Angular 的依赖注入来与 Facade 进行沟通的。
值得一提的是，markNotificationAsRead 方法中的行为我认为并不恰当。UpdateNotificationStatusFacade 应该在更新成功之后自己通过领域事件来通知 GetUnreadNotificationCountFacade 重新获取数据，而不是让组件类手动进行，导致这部分的业务逻辑泄露到了 feature 层中。

![](/images/uploads/frontend-with-ddd-3-25.png)

## 小结

关于 DDD 在前端开发中的应用，我依然在探索当中，上述内容很可能只是冰山一角。 Manfred 为我们提供了一条可行的道路，而在 Matrix 新反馈系统的实践中我依然遇到了一些比较棘手的问题，例如我起初一直无法在采用了 DDD 的 Nx workspace 项目中正确地配置 Angular 的路由模块以及懒加载，又如 Angular 的依赖注入系统在适配到懒加载的 library 时存在陷阱等。不过经过十几天的搏斗，Matrix 新反馈系统最终还是完成了开发，在这个过程中我不仅增长了对 DDD 的认识，也学习了很多 Angular 的冷门知识点，可以说是大有所益了。

Nx Workspace 除了支持 Angular 之外，其实也支持 React，并且 Github 上已经有一些 Star 很多的项目在应用着了。如果你有兴趣，可以在学习 DDD 之余看看这些项目。总的来说，DDD 是软件工程里的一座丰碑，启发了无数对架构感兴趣的程序员。

## 链接

- [探究 DDD 在前端开发中的应用：前言](/articles/frontend-with-ddd)
- [探究 DDD 在前端开发中的应用（一）：从软件开发的本质讲起](/articles/frontend-with-ddd-1)
- [探究 DDD 在前端开发中的应用（二）：什么是 DDD](/articles/frontend-with-ddd-2)
- **[探究 DDD 在前端开发中的应用（三）：探究 DDD 在前端开发中的应用](/articles/frontend-with-ddd-3)**
