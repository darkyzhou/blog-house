---
title: Angular经验分享：组件性能优化案例
slug: angular-performance-case
date: 2021-02-15T18:23:42.123Z
category: 前端修炼手册
tags:
  - 前端技术
  - Angular
---

本文章由本人发表于：https://www.yuque.com/matrix-blog/frontend/component-performance-case

### 背景

本 Matrix 团队是一个主要由中山大学计算机学院的大二、大三学生构成的小型开发团队。Matrix 课程系统是我们团队主要维护的一个项目，它是一个面向计算机相关课程的学生的在线课程系统，学生可以在每次上实验课时登录系统进行做题，并且能够通过提交程序代码让系统进行在线评测（OJ），获取分数反馈等。本系统同时也承担为学院的期末考、研究生复试提供考试平台等任务。本团队的介绍页：https://matrix.sysu.edu.cn/about/。

其中，本系统的前端部分使用的框架是 Angular，从 2017 年初至今已经经历数届学长的开发维护，也难以避免地出现了那些规模较大的项目容易出现的问题：缺乏文档、代码质量差，可维护性低下、性能问题。本文将以一个近期解决的组件性能问题为基点，谈谈 Angular 前端 App 中的性能问题。

### 案例介绍

在课程系统中，我们在一次迭代后，为那些需要编写程序代码的题目提供了一个新的、较为复杂的做题组件，它的样貌如下图所示：

![](/images/uploads/angular-performance-case-1.png)

此做题组件左侧是一个 Tab 组件，显示题目信息、得分情况、排名、得分等信息，而右侧则是一个使用`monaco-editor`实现的代码编辑器。它们中间夹着一个分栏组件，用户可以通过鼠标拖动此分栏来调整左侧组件和右侧组件的宽度比例。

自新做题组件上线以来，我们时常会收到用户的反馈，他们抱怨拖动分栏的时候整个页面会变得非常卡顿，而且笔记本的风扇转速会突然加快，也就是说 CPU 占用会变高。但由于拖动分栏并不是用户的高频操作，以及平时学业繁重，我们一直没能抽出时间来调查这个问题，直到寒假时，笔者才有空解决了这个问题，并以此撰写了这篇文章。

下图是拖动分栏组件的效果，可以看到分栏组件不跟手，页面出现了明显的卡顿、掉帧。这些问题在一些低端的笔记本上更加严重。

![](/images/uploads/angular-performance-case-2.gif)

### 原因分析

为什么拖动分栏会导致页面的 CPU 占用陡增呢？笔者首先使用了 Chrome DevTools 的 Performance 分析工具，分析了在拖动分栏组件过程中前端 App 的性能状况，得到了如下图所示的结果：

![](/images/uploads/angular-performance-case-3.png)

仔细观察中间的 Main 栏目，可以看到下方的第一条横轴中有多个右上角含有红色三角形的灰色矩形。这里，第一条横轴的矩形从左到右表示随着时间推移，每个 Task 的用时。红色三角形则是 DevTools 给出的警告：此 Task 用时过长。笔者用鼠标指向了其中一个矩形，它对应的 Task 用时已经达到了惊人的 51.94ms！

这些灰色矩形下方展示的是此 Task 对应的调用栈，黄色的矩形表示的是 JavaScript 代码的执行。可以看到，这些用时过长的 Task 下方几乎都是黄色矩形，笔者由此断定：正是这些用时过长的 JavaScript 代码执行，导致了用户明显可感知的页面卡顿，以及 CPU 占用的陡增。

笔者之所以这样断定，是由于在浏览器中，我们有如下的特殊的进程模型（https://aerotwist.com/blog/the-anatomy-of-a-frame/）：

![](/images/uploads/angular-performance-case-4.jpg)

现在，我们换一个角度，从浏览器如何产生每一帧入手。在一块使用了 60Hz 刷新率显示器的设备中，每隔一定时间，系统会给浏览器的 Renderer Process 发出一个 vsync 信号。其中的 Compositor Thread 会由此触发生成一帧的任务。而在 Main Thread 中，需要进行以下几步任务：

![](/images/uploads/angular-performance-case-5.png)

大体上来说，在 Main Thread 中，浏览器主要经历了 JavaScript 执行、样式计算、Layout 计算、生成渲染数据的这几步。这几步的主要工作就如它们的名字，如果想要了解详细情况，请阅读文章[The Anatomy of a Frame](https://aerotwist.com/blog/the-anatomy-of-a-frame/)。

在生成了渲染数据之后，浏览器的 GPU 进程最终会接收数据，在设备的屏幕上渲染出这新的一帧。因此，为了能够让用户在使用前端 App 时不会感到所谓的“卡顿”现象，我们自然就需要保证浏览器生成每一帧的时间间隙不超过 1s/60Hz = 16.6ms。只要有一些帧的生成时间超过了 16.6ms，此时的 FPS 就会低于 60 了；如果 FPS 降到 30 以下或者波动很大，则将会产生用户肉眼可见的掉帧，也就是所谓的“卡顿”了。因此，为了保证用户体验，我们最好要死守 16.6ms 的这条线。

有必要指出的是，在 Main Thread 中的这几步工作中，其实后面的样式计算、Layout 计算等步骤都不太能够由程序员自己决定，因为这些代码都是浏览器厂商自己编写的，往往是 C++代码。真正能够被程序员掌控的则是最开始的 JavaScript 代码执行的这一步。在实践中，人们通常假设后面的样式计算等几步需要花费 6ms 左右的时间，因此留给 JavaScript 代码执行的时间就只剩 10ms 不到了。回到前面的性能分析结果，我们发现拖动分栏组件的过程中有些 JavaScript 代码的执行过程竟然花费了长达 51.94ms，那么对应的 FPS 也就自然连 20 都没有了，这就是卡顿的直接原因。

另外，图中值得一提的还有：在浏览器中，JavaScript 甚至都不能算是一个真正的“单线程语言”，因为它其实与浏览器中进行 HTML 转化、样式计算、Layout 计算、渲染等部分的代码共享同一个 Main Thread（Web worker 除外）。同时，由于需要保证 60 帧下的良好用户体验，JavaScript 代码的执行时间需要被严格地限制，所以 JavaScript 在浏览器中可谓是“带着镣铐起舞”，JavaScript 引擎为什么会选择使用事件驱动模型似乎也有了一定程度上的解释。

### 问题解决第一步：monaco-editor

接下来，我们回到性能分析结果，看看那些执行时间过长的 JavaScript 代码的调用栈，弄清楚它们到底在干什么。下图是生成单个帧的过程中发生的 Task 以及调用栈情况：

![](/images/uploads/angular-performance-case-6.png)

这些 Task 的调用栈颇为壮观，但壮观归壮观，它们总共花费了将近 60ms，产生了严重的卡顿问题。仔细分析这些 Task，它们可以被分为三个部分。前面三个黄色的“Timer Fired”是做题组件使用的**<u>三个</u>**`perfect-scrollbar`第三方组件通过`setInterval`定期检查 Layout 是否发生改变，进而修改自身的尺寸等属性。中间的黄色的“Event: mousemove”则是这次性能问题的主角，我们稍后再讨论。后面的“Animation Frame Fired”则是`monaco-editor`代码编辑器通过`requestAnimationCallback`给每一帧的生成挂上的钩子，用于检查并更新自身的 Layout，比如右边的滚动条的位置。

笔者仔细分析之后，发现做题组件的性能问题稍微有些棘手：前面的部分和后面的部分都是由第三方组件触发的任务。只有中间的部分是做题组件的分栏组件通过给 document 挂载 mousemove 钩子触发的。

经研究发现，`monaco-editor`和`perfect-scrollbar`其实都不应该以这么高的频率检查更新自己的 Layout。特别是`monaco-editor`，它在每一帧的生成时都要进行一次 Layout 检查与更新，花费了足足 20ms 左右的时间。翻阅[相关 issue](https://github.com/microsoft/monaco-editor/issues/28#issuecomment-228523529)发现此问题的罪魁祸首是它的设置里的`automaticLayout`选项，开启之后它会定期自动运行 Layout 检查。看来是前人在进行新做题页面的编写时，没有考虑到以前遗留下来的这个选项会对性能造成如此巨大的负面影响。要解决这个问题其实非常简单，只需关闭这个选项，然后我们额外再拖动分栏时使用一个时间间隔较长的定时器，手动调用`monaco-editor`的`layout`方法让它进行 Layout 检查：

```typescript
private initAutoFitWidth() {
  let lastWidth = this.width;
  let start: number;

  const autoFitWidth = (timestamp: number) => {
    // 这里使用的是requestAnimationFrame，保证此函数在每一帧最多调用一次
    // 同时判断两次执行的时间戳，保证600ms才执行一次下面的函数
    if (timestamp - start < 600) {
      this.handle = window.requestAnimationFrame(autoFitWidth);
      return;
    }
    start = timestamp;
    if (lastWidth !== this.width) { // 缓存上一次更新的width，跳过不必要的调用layout操作
      lastWidth = this.width;
      this.editor.layout();
    }
    this.handle = window.requestAnimationFrame(autoFitWidth);
  };

  this.handle = window.requestAnimationFrame(
    timestamp => {
      start = timestamp;
      autoFitWidth(timestamp);
    }
  );
}
```

对于`perfect-scrollbar`，课程系统前端 App 其实使用的是[zefoy/ngx-perfect-scrollbar](https://github.com/zefoy/ngx-perfect-scrollbar)，它对前者进行了一些简单的包装，提供 Angular 组件与指令。然而很可惜的是，此组件并没有提供选项来控制检查更新 Layout 的时间间隔，无奈只能作罢，以后有时间再去自行编写一个`perfect-scrollbar`的包装组件。

接下来我们终于可以将目光转向中间的“Event: mousemove”部分了，它到底做了什么工作呢？是不是真的需要花费这么长时间呢？

### 问题解决第二步：“罪恶”的 Change Detection（变更检测）

经过检查“Event: mousemove”部分下面的 JavaScript 调用栈，我们可以看到很多名为`detect***Changes`、`check***View`这样的函数调用。这里其实就是分栏组件监听的 document 的 mousemove 事件触发了 Angular 对从分栏组件到它的父组件（也就是做题组件），再到后者的父组件，直到根组件的这样一棵组件树进行 Change Detection 的过程。

这里其实涉及了一个 Angular 最初的设计思路：Angular 通过 Zone.js 给 DOM 事件、`setTimeout`、`XHR`等 API 加上钩子，以此触发对用户编写的组件的变更检测，因为它不知道作为程序员的我们会在什么时机改变组件模板中的什么值，所以使用了这样的方法来保证全方位地覆盖程序员**可能**会更新模板上的值的时机。如果你有兴趣，推荐阅读文章[Optimizing Angular Change Detection Triggered by DOM Events](https://netbasal.com/optimizing-angular-change-detection-triggered-by-dom-events-d2a3b2e11d87)。

这种设计思路一方面给程序员带来了便利，因为程序员只需要像`this.productList = [...];`这样简单的赋值操作就能马上给用户展示商品列表数据。但另一方面，这也很容易导致性能问题的产生：如果进行变更检测的过程耗时较长，但其实触发的变更检测根本没有必要，那么就会出现上文说到的卡顿问题了。要知道，Angular 进行变更检测的具体步骤是：对组件树中的各个组件模板进行新一轮的求值运算，然后对比上一次的求值结果，有改动则进行更新。

在我们的做题组件中，执行这些 Change Detection 竟然需要花费这么多时间，这是因为做题组件结构复杂、模板中需要计算的表达式非常地多，光做题组件自己的模板 html 文件就有 800 多行（已经无力重构了，历史遗留问题众多）。然而，这里有一个很根本性的问题：**拖动分栏组件其实仅仅是为了更新左侧右侧组件的宽度，除此之外没有其他任何目的，也就是说 mousemove 触发的变更检测是毫无必要的**。仔细想想，拖动分栏的过程中，左侧的题目信息、提交记录、排名信息等其实没有任何改变、而右侧的代码编辑器的代码内容也没有，为什么还需要进行变更检测，进行漫长的模板求值运算呢？

事实上，为了解决这类问题，Angular 为我们的 App 提供了`NgZone`的实例包装。我们可以通过 DI 获得一个`NgZone`的实例，然后调用`runOutsideAngular`函数将我们需要监听的 DOM Event、或者要执行的`setTimeout`等置于 Zone.js 的钩子之外，即不让这些代码触发 Angular 的变更检测：

```typescript
this.zone.runOutsideAngular(() => {
  fromEvent<MouseEvent>(document, 'mousemove').subscribe((event) => this.handleMouseMove(event));
  fromEvent<MouseEvent>(this.resizer.nativeElement, 'mousedown').subscribe((event) =>
    this.startDrag(event)
  );
  fromEvent(document, 'mouseup').subscribe(() => this.stopDrag());
  fromEvent(document, 'mouseleave').subscribe(() => this.stopDrag());
});
```

前文在讲到对`monaco-editor`的优化时，其中的`autoFitWidth`方法事实上也需要使用`runOutsideAngular`，但由于篇幅原因略去了。

### 优化结果

经过上述两步的优化，在生成一帧期间运行的 JavaScript 代码数目大大减少了，从而在做题页面里拖动分栏组件已经能够稳定运行在 50fps 以上，上图是优化前的效果，下图是优化后的效果：

![](/images/uploads/angular-performance-case-2.gif)

![](/images/uploads/angular-performance-case-7.gif)

注意右侧`monaco-editor`的滚动条，可以明显发现它适应最新的宽度好像有些迟滞，这是因为前面我们将它进行 Layout 运算的时间间隔扩大到了 600ms，其实这个间隔稍微有些长了，不过影响并不大。同时，由于避免了变更检测带来的大量不必要的模板运算，拖动分栏组件时 CPU 占用也大大降低了。

### 深入性能问题

Angular 借助 Zone.js 实现的变更检测触发机制的确非常便利，但它同时也容易让程序员们诱发性能问题。为此，较新版本的 Angular 中引入了`ChangeDetectionStrategy.OnPush`，只要给组件启用这项设定，那么变更检测的触发时机将会被缩减为以下三种情况，具体可以参考文章[Angular OnPush Change Detection and Component Design - Avoid Common Pitfalls](https://blog.angular-university.io/onpush-change-detection-how-it-works/)：

1. 通过@Input()输入的属性的引用发生变化（基本上约等于`!==`的判断）。
2. 自身或模板中引用的组件（即 children）发生了 DOM 事件。例如，A 组件模板中引用了 B 组件，则在 A 组件发生 DOM 事件时，B 组件不会进行变更检测。
3. 通过 DI 注入 ChangeDetectorRef，调用`detectChanges`函数。值得一提的是，Angular 自带的 async pipe 利用的就是类似的`markDirty`函数在 Observable 发射新值时将组件标记为需要检查更新。

`ChangeDetectionStrategy.OnPush`自被加入以来，一直被很多人认为是 Angular 组件的必备选项。虽然它的引入使得像`fetch(...).then(response => this.productList = response.list)`这样的异步请求更新展示数据的操作已经不能再像以前一样自动触发变更检测，但人们仍然可以使用 RxJS，搭配 async pipe 实现类似的功能，而这也是 Angular 官方在文档里所力荐的实践。

不过它仍然不能解决一切的性能问题。例如本文中拖动分栏导致性能问题，使用`ChangeDetectionStrategy.OnPush`并没有很大改善。因为分栏拖动时的 DOM Event 涉及的组件树仍然非常庞大，运行变更检测仍然需要花费很多时间。这种时候或许就需要使用`NgZone`的`runOutsideAngular`了。难道这种性能问题只有这一种解决方法吗？答案显然是否定的。

最近几年，笔者看到不少 Angular 大牛发表文章，提倡手动禁用 Zone.js，全面投入 RxJS 工具链的怀抱。Angular 官方也引入了一项新的参数来禁用 Zone.js：

```typescript
platformBrowserDynamic()
  .bootstrapModule(AppModule, { ngZone: 'noop' }) // 使用'noop'参数禁用Zone.js
  .catch((err) => console.error(err));
```

在笔者看来，大牛们的主旨其实就是：不再让 Angular 通过挂载各种钩子来确定我们想在什么时候更新模板数据，而是**我们借助 RxJS 工具链的帮助，主动告诉 Angular 我们需要更新什么组件的什么属性**，而且这种主动的告知的粒度是非常细的，可以细至一个`<span>{{name}}</span>`。这是一种化被动为主动的改变。

受到这股思想的影响，诞生了许多能够帮助我们实现这种思路的框架或工具库，例如[@ngrx/component](https://ngrx.io/guide/component)、[ngxs](https://www.ngxs.io/concepts/intro)和[rx-angular](https://rx-angular.io/)。rx-angular 官方的文章[Rendering Issues in Angular](https://github.com/rx-angular/rx-angular/blob/master/libs/template/docs/performance-issues.md)简单地介绍了目前 Angular 前端性能问题的处境，以及 rx-angular 给出的解决思路。笔者在重写的新课程系统前端项目中选择了使用 rx-angular，将会在不久的将来写一篇经验谈，介绍本团队在使用 rx-angular 实现新前端过程中的经验积累。
