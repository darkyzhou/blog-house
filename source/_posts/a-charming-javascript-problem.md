---
title: 如何令 a === a + 1？一道迷人的 JS 小题目
slug: a-charming-javascript-problem
date: 2021-03-02T17:16:38.104Z
category: 前端修炼手册
tags:
  - JavaScript
excerpt: 如何令 a === a + 1 成立？看看笔者的几个思路，以及这个看似简单的问题背后涉及的各种知识！
---

### 前言

最近，网络上出现了一道很有意思的 JavaScript 小题目：

```javascript
// 如何声明变量 a 使得下面的断言成立？
console.assert(a === a + 1);
```

笔者稍微研究了一下，题目的核心在于`===`运算符，在[ECMA-262](https://tc39.es/ecma262/#sec-strict-equality-comparison)规范里这个运算符的执行过程是这样的：

> The comparison x === y, where x and y are values, produces true or false. Such a comparison is performed as follows:
>
> 1. If [Type](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)(x) is different from [Type](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)(y), return false.
> 2. If [Type](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)(x) is Number or BigInt, thena. Return ! [Type](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)(x)::equal(x, y).
> 3. Return ! [SameValueNonNumeric](https://tc39.es/ecma262/#sec-samevaluenonnumeric)(x, y).

也就是说，`a`和`a + 1`首先需要是同一种类型。那这样看来，解题的突破口在于第二点和第三点。这两点的具体含义我们在后文中结合解题思路介绍。

### 溢出法

溢出法利用的是执行过程的第二点，我们尝试使用 Number 的相等运算解题。

#### Number.MAX_VALUE

令`a`为`Number.MAX_VALUE`，可以使得断言成立。至于这种方法背后的原理，笔者认为可以这样阐释：

ECMAScript 的规范文档[ECMA-262](https://tc39.es/ecma262/#sec-number.max_value)里说，`Number.MAX_VALUE`的值大约为`1.7976931348623157e+308`。这里虽然用了“大约（approximately）”一词，但是笔者测试 Node 和 Chrome 的`Number.MAX_VALUE`都精确到了这个值。[规范里还说](https://tc39.es/ecma262/#sec-mathematical-operations)，ECMAScript 在计算 Number 类型的值的加法时遵守[IEEE 754-2019](https://ieeexplore.ieee.org/document/8766229)规范，于是根据后者我们可以知道：因为`Number.MAX_VALUE`的值和`1`的大小相差太过悬殊，并没有足够的位正确地表示和，因此发生了溢出，即`Number.MAX_VALUE === Number.MAX_VALUE + 1`。

这里再提一个有趣的现象：我在 Chrome 上和 Node 上计算`Number.MAX_VALUE + 1e+291`的结果均为`1.7976931348623157e+308`；而计算`Number.MAX_VALUE + 1e+292`的结果为`Inifinity`。这其实也可以按照上述 IEEE 的规范解释：后者在计算本身的角度上没有发生溢出，因为小数点最后一位的确需要加一，但此时已经超出 ECMAScript 的规范里的范围了，于是被置为`Infinity`。

#### Number.NEGATIVE_INFINITY 和 Number.POSITIVE_INFINITY

令`a`为上述两个值也可以使得断言成立。

根据[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity)所说，ECMAScript 的规范里规定了`Infinity`值加一还是`Infinity`，`-Infinity`值加一还是`-Infinity`（有正负两个表示“无穷大”的值）。

### Getter 法

解法如下所示：

```javascript
let val = 1;
Object.defineProperty(globalThis, 'a', {
  get() {
    return val--;
  },
});
console.assert(a === a + 1);
```

这里需要注意，按照[ECMA-262](https://tc39.es/ecma262/#sec-number.max_value)中[关于`===`运算符的操作数运算步骤](https://tc39.es/ecma262/#prod-EqualityExpression)：

> [EqualityExpression](https://tc39.es/ecma262/#prod-EqualityExpression) : [EqualityExpression](https://tc39.es/ecma262/#prod-EqualityExpression) === [RelationalExpression](https://tc39.es/ecma262/#prod-RelationalExpression)
>
> 1.  Let lref be the result of evaluating [EqualityExpression](https://tc39.es/ecma262/#prod-EqualityExpression).
> 2.  Let lval be ? [GetValue](https://tc39.es/ecma262/#sec-getvalue)(lref).
> 3.  Let rref be the result of evaluating [RelationalExpression](https://tc39.es/ecma262/#prod-RelationalExpression).
> 4.  Let rval be ? [GetValue](https://tc39.es/ecma262/#sec-getvalue)(rref).
> 5.  Return the result of performing [Strict Equality Comparison](https://tc39.es/ecma262/#sec-strict-equality-comparison) rval === lval.

对于`a === a + 1`而言，引擎会计算左边`a`表达式的值，即通过我们定义的 getter 得到`1`，然后计算右边`a + 1`表达式（注意`+`的优先级比`===`高）的值也得到了`1`。这里，反复运行`a === a + 1`的结果都是`true`。

另外，笔者这里使用了一个特殊的对象`globalThis`，详情见[规范](https://tc39.es/ecma262/#sec-globalthis)。简单来说它提供了一个统一的访问不同环境下的全局根对象的方法，比如当上述代码运行在 Node 时，`globalThis === global`成立，后者是 Node 运行环境提供的全局根对象；当上述代码运行在浏览器时，`globalThis === window`成立，后者是浏览器环境提供的全局根对象。

### 如果是 `a == a + 1`呢

其实本道题目原本是判断`a == a + 1`，笔者将它魔改为了`===`。如果是判断`==`的话，本题的方法还会再多几个，突破口之一就是`==`相比`===`，多了执行各种类型转换的步骤，具体请见[规范](https://tc39.es/ecma262/#sec-abstract-equality-comparison)。这里笔者给出其中一个方法：

```javascript
let first = true;
const a = {
  [Symbol.toPrimitive]() {
    const ret = first ? 'a' : 'a1';
    if (first) first = false;
    return ret;
  },
};
console.assert(a == a + 1);
```

这里指的强调的是，此处和上面的`===`的解答不同，对于`toPrimitive`的调用是`a + 1`先于`a`进行。

因为引擎先对两边表达式求值，那么左边`a`表达式的结果就是`a`对象，右边的表达式运算按照[加法运算的规范](https://tc39.es/ecma262/#sec-applystringornumericbinaryoperator)需要对`a`调用`toPrimitive`函数得到字符串`'a'`然后与数字`1`继续相加得到`'a1'`。然后，引擎开始计算`a`对象是否`==`得到的`'a1'`，按照[规范](https://tc39.es/ecma262/#sec-abstract-equality-comparison)中的这一条：

> 12. If Type(x) is Object and Type(y) is either String, Number, BigInt, or Symbol, return the result of the comparison ? ToPrimitive(x) == y.

对`a`对象再次调用`toPrimitive`函数得到`'a1'`字符串，那么`'a1' == 'a1'`自然也就成立啦。

以上只是笔者想到的一个方法，网络上还有其他大牛想到的更多更精妙的解法，有兴趣的读者可以自行搜索。

### 后记

很多人看到`a === a + 1`这样的问题的时候，第一感觉可能会是：知道这个有什么用？不过，一旦我们深入研究这道题目的解题思路，我们就会绞尽脑汁四处查找资料，往往能够获得很多收获。通过研究这道题目，笔者也学会了如何阅读 ECMAScript 的文档，同时巩固了对它的各种求值运算的细节的认识，真可谓是“绝知此事要躬行”。

其实，像是`a === a + 1`这样的题目，从它的内容看上去可能的确没有什么用，为什么我要知道哪些`a`能让它成立呢？谁会需要这样的功能呢？在笔者看来，我们可以将这种题目类比于数学上的哥德巴赫猜想（尽管从高度上看，后者对人类产生的影响或许更加深远），仅仅从内容上看，哥德巴赫猜想可能并没有什么实际上的作用，知道三个质数之和的这种性质难道能让人能够多吃一点饭吗？但是，自它提出以来，无数极富盛名、才华横溢的数学家为之付出了无数心血却都没能彻底解开它的谜底。这就说明人类目前还欠缺了这方面的知识，不足以撼动它作为世界近代三大数学难题之一的地位。一旦人类有朝一日解开了它的谜底，就说明人类的数学知识宝库又一次大大地被丰富了。进而，数学的知识又会辐射到物理学、化学、计算机学等，再到人类生活的方方面面，助力人类在探索未知的宇宙中迈出坚实的一步。

也许 JavaScript 的一个这样的问题远达不到哥德巴赫猜想的高度，但——你懂我意思。我们 JavaScript 世界什么时候也来点哥德巴赫猜想呢？
