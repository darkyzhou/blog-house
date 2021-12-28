---
title: "探究 rootless containers 下通过 systemd 配置 cgroup v2 "
date: 2021-12-07T06:56:59.095Z
category: 'Linux 研究日志'
tags:
  - 容器技术
  - runc
  - systemd
  - cgroup
  - go
excerpt: 本文将介绍如何在以一个普通用户的权限创建使用 Linux 容器的情况下，通过 systemd 配置 cgroup v2。
---
### 前言

笔者在上一篇博文[《探索 Rootless Containers：应用于 OJ 的下一代技术》](https://darkyzhou.net/articles/rootless-containers-oj)中提到，我们现在已经可以通过 umoci、runc 这样的工具以一个普通用户的权限创建并运行容器，这种技术被称为 Rootless Containers。我们也可以使用 seccomp 和 rlimit 对容器进程做出一定程度的限制，如限制部分系统调用、限制打开的文件数量等。

不过，我们还没有扫清 Rootless Containers 应用于 OJ 这一课题的最后一个障碍：cgroup。容器技术需要的许多重要的限制功能其实都由 cgroup 提供，例如 cpuset、io 限制等。并且，cgroup 能够提供 oom kill 功能，停止超出内存限制的进程；cgroup 还能统计进程占用的 cpu、内存等信息。这些对于 OJ 而言都是相当重要的功能。

本文将介绍如何在以一个普通用户的权限创建使用 Linux 容器的情况下，通过 systemd 配置 cgroup v2。

### cgroup v1

先来看看不使用 cgroup v1 的几个原因：

1. cgroup v1 起初是提供给 root 使用的，普通用户使用 cgroup v1 需要经过某种委托机制，即由一个拥有 root 权限的服务去代替普通用户和 cgroup 进行交互，[但这存在安全风险](https://rootlesscontaine.rs/how-it-works/cgroups/#v1)，所以**在 Rootless Containers 的定义里不包含 cgroup v1，只能使用 cgroup v2**。

  另外，如果跑在 Kubernetes 里的应用要使用 cgroup v1，则一般需要在 Pod 里挂载 cgroup 文件夹，还要给容器赋予足够的权限，这样来看是非常不安全的。

2. cgroup v1 因为各种历史原因，目前的实现很不统一，各种 controller 的开发工作没有很好地协调，导致 controller 之间存在许多不一致性。同时，也因为这种不统一的实现，用户使用 cgroup v1 也很麻烦，例如要限制某个进程的 cpu、内存、io 使用，需要分别到三个 controller 的目录下进行交互。

  因此，cgroup v2 就被提了出来，拥有更统一、方便使用的 API。虽然因为兼容性考虑 cgroup v1 可能会一直留在内核里，但 **cgroup v2 已经开始在各大发行版中取代了 cgroup v1 的地位**。例如：Ubuntu 从最近的 21.10 版本开始就默认只开启 cgroup v2，禁用 cgroup v1。

3. 在 cgroup v1 中，一个进程的不同线程可以分别属于不同的 cgroup，很多人认为这个设计没什么用，还白白添加了复杂性。更糟糕的是，这给 cgroup v1 自身挖了许多坑，比如 memory controller（即管理内存限制的 controller）不能正常工作了，因为不同线程属于不同 cgroup，分属不同 memory controller 管辖，但是它们却又共享同一个进程的内存空间，这种情况下 memory controller 又该怎么工作呢？

  因此在 cgroup v2 里就去掉了这种设计，一个进程的所有线程只能属于同一个 cgroup（虽然后来又在 threaded mode 里加了回来，不过加上了很多限制）。


在笔者看来，当前新开发的应用已经没有必要考虑 cgroup v1 了，cgroup v2 拥有更加统一、易用、符合直觉的 API 设计，并且已经开始取代 cgroup v1。

### cgroup v2

cgroup v2 和 cgroup v1 的具体差别请读者自行查阅资料。根据 [man7 文档](https://man7.org/linux/man-pages/man7/cgroups.7.html)，cgroup v2 清楚地定义了如何向普通用户提供 cgroup v2 交互能力，粗略来说就是：

1. 创建一个子文件夹作为 sub-cgroup

2. 在这个子文件夹的父文件夹（也是一个 cgroup）里，修改 `cgroup.subtree_control` 文件来控制 sub-cgroup 能使用的 controller 种类。

3. 通过 chown 给普通用户来让他能够使用这个 sub-cgroup。


在目前的许多发行版中，`/sys/fs/cgroup` 已经自动被 systemd 挂载。但 systemd 做的时期可不仅仅是帮你 `mount -t cgroup2` 这么简单，它做的事情是让自己“拥有”这个 cgroup v2。换句话说，任何想要使用 cgroup v2 的进程都需要经过 systemd 的管理。

你不能在 `/sys/fs/cgroup` 里直接使用上面 man7 提到的方法，因为 [systemd 的文档](https://systemd.io/CGROUP_DELEGATION/)这么警告你：

> Specifically: 🔥 don’t create your own cgroups **<u>below the root cgroup</u>** 🔥. That’s owned by systemd, and you will step on systemd’s toes if you ignore that, and systemd will step on yours. Get your own delegated sub-tree, you may create as many cgroups there as you like. Seriously, if you create cgroups directly in the cgroup root, then all you do is ask for trouble.

我们可以通过下列方法让 systemd 给普通用户创建一个 sub-cgroup：

```
$ sudo mkdir -p /etc/systemd/system/user@.service.d
$ cat <<EOF | sudo tee /etc/systemd/system/user@.service.d/delegate.conf
[Service]
Delegate=cpu cpuset io memory pids
EOF
$ sudo systemctl daemon-reload
```

这样，systemd 就会创建一个类似于 `/sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service` 的文件夹，这个文件夹的所有者是普通用户，对应着一个完全由普通用户控制的 cgroup。我们可以在这个文件夹里随意创建新的文件夹（也就是 sub-cgroup）来限制进程。可以通过读取 `memory.stat` 和 `cpu.stat` 文件来获得进程使用的内存和 cpu 信息。

不过，因为不知道 systemd 具体给当前用户分配了哪个文件夹，所以一般情况下应用应该调用 DBus 来创建一个 transient unit，告诉 systemd 在当前用户的 cgroup 里给应用开一个新的 sub-cgroup。在 transient unit 里我们需要指定 `[Delegate]` 参数才能告诉 systemd 这个 sub-cgroup 交给我们的应用自己管理，具体可见[文档](https://systemd.io/CGROUP_DELEGATION/)。

### runc 与 libcontainer

笔者已经在前一篇文章[《探索 Rootless Containers：应用于 OJ 的下一代技术》](https://darkyzhou.net/articles/rootless-containers-oj)中介绍了如何使用 runc 创建 rootless container。但没有介绍 cgroup v2 的配置。接下来笔者结合上面对 cgroup v2 的讨论，介绍如何让 runc 得以利用 cgroup。

> 有一点需要提前说明：**在这种场景下，和 runc 交互的最好方法应该是在 go 程序里进行调用，而不是通过容器的 json 文件**。因为 runc 和它内部的 libcontainer 有很多非常实用的 API 并没有通过 json 接口暴露。

其实 runc 的 libcontainer 提供了一个 systemd driver，支持在 rootless 情景下利用 systemd 创建 cgroup v2 文件夹。但是它有一个严重的缺陷：当容器进程退出之后，systemd 会自动清理创建出来的 cgroup，导致我们的应用无法收集 cpu、内存占用等信息。

从 [runc 源码](https://github.com/opencontainers/runc/blob/HEAD/libcontainer/cgroups/systemd/v2.go) 中可以看到，它是通过 DBus 创建了一个 transient scope 来让 systemd 为创建的容器进程开一个 cgroup。问题的关键在于，依据 [systemd 对 transient scope 的定义](https://systemd.io/CGROUP_DELEGATION/)：

> The .scope unit type. This is very similar to .service. The main difference: the processes the units of this type encapsulate are forked off by some unrelated manager process, and that manager asked systemd to expose them as a unit.

Transient scope 代表的容器进程是一种由其他进程（也就是调用 runc 的我们的应用）创建的子进程，因此在子进程退出之后**应该自动清理掉**。对于 runc 本身来说这没有什么问题，但是对于我们的应用来说，自动清理就意味着无法知道容器运行结束之后它到底占用了多少 cpu 时间、占用了多少内存等信息。

而且 runc 的 systemd driver 的参数非常不人性化。它会在配置 cgroup 失败之后默默地打印一行 warning 然后继续运行容器，忽略用户给定的 cgroup 配置参数。在 OJ 的场景下这个行为是无法接受的，不能出现有些用户的提交的代码可以受到限制而有些不受限制的情况。

因此，我们只好使用 runc 为 rootless 模式提供的另一个实现：fs driver。这个实现做的事情就是直接读写给定的 cgroup 文件夹来为容器初始化相关设定，而且它不会在容器停止之后就马上删掉文件夹。至于如何给 runc 提供 cgroup 文件夹则需要我们另辟蹊径了。

> 其实 runc 调用 systemd 的实现最终也是用到了这个 fs driver。它是先调用 systemd 申请到一个 cgroup，再输入给这个 fs driver 来初始化各种设定。

### 尝试

经过上面的研究，笔者马上想到了一个解决的办法：应用首先调用 DBus，给自己的进程创建一个 transient scope，这样就能开一个 sub-cgroup 文件夹给 runc 使用了。

> 调用 DBus 的相关代码可以参考 [runc 的源码](https://github.com/opencontainers/runc/blob/HEAD/libcontainer/cgroups/systemd/v2.go)。对于 Debian 系发行版，需要安装 `dbus-user-session` 包来开启相关功能。

然而，笔者试了一下并不能成功，详细的原因可以见[我发的 issue](https://github.com/opencontainers/runc/issues/3255#issuecomment-967780774)。简单来说，runc 为了尝试开启所有的 cgroup controller，会迭代地向输入给 runc 的 cgroup 的所有祖先 cgroup 的 `cgroup.subtree_control` 里写入所有类型的 controller。

但是 cgroup v2 里有一条坑爹的设定：

> A domain cgroup is turned into a threaded domain when one of its child
> cgroup becomes threaded or threaded controllers are enabled in the
> "cgroup.subtree_control" file while there are processes in the cgroup.
> A threaded domain reverts to a normal domain when the conditions
> clear.

如果一个 cgroup 已经包含了一个进程（比如上面笔者应用的进程），那么 runc 在开启 cpu controller 的时候会被 cgroup 以为是要开启 threaded mode，导致笔者应用自己的 cgroup 和传给 runc 的 sub-cgroup 全部变成 threaded mode。

这个模式下的 cgroup 控制的最小单位从进程变成了线程，但是 memory controller 和 io controller 也无法使用了（原因比较明了：怎么可以限制线程的内存占用呢？）。所以笔者的目的也就不能很好地完成了，不能拿到内存占用数据的 OJ 还有啥意义呢。

### 解决方案

笔者认为上面的思路是对的：应用自己向 systemd 申请一个 cgroup，然后开一个 sub-cgroup 给 runc 使用。这种交互应该符合 systemd 的设计，听上去也符合直觉。如果能够绕过 cgroup 的那条坑爹设定就能彻底解决问题。

经过笔者的思考和尝试，我总结出了以下的解决方法：

1. 应用手动调用 DBus，为当前的应用进程创建一个 transient scope。systemd 保证创建出来的 cgroup 可以被当前用户（普通用户）读写。

  这一步是为了确保 runc 创建的容器进程依然能够被当前用户的 cgroup 管辖。否则它默认会被 root cgroup（也就是 systemd 直接管理的那个顶层 cgroup）管辖，当前用户（普通用户）是没有权限的。

2. 应用手动调用 DBus，创建一个 slice（这种 unit 不需要绑定进程）。systemd 保证创建出来的 cgroup 可以被当前用户（普通用户）读写。

3. 应用在上述 slice 文件夹里创建一个新的文件夹，即新的 sub-cgroup，将路径传给 runc，让它使用 fs driver 实现初始化 cgroup 设置。

  此时 runc 会尝试向这个 cgroup 的 `cgroup.procs` 写入 runc 创建的容器进程的 PID。因为在 1 里我们提到这个进程目前已经处于一个属于当前用户的 cgroup 里面，所以 runc 可以成功写入 PID 来将进程迁移到这个 cgroup 里。反之，如果我们不做 1，那么 runc 会因为权限不足而失败，因为不能把进程从 root 的 cgroup 里移出来。

4. 我们已经可以在容器结束之后调用 runc 相关的 API 来获得 cgroup 的相关信息，比如 cpu 时间（包括用户态时间、内核态时间）、内存占用（包括 swap）等。

经过测试，上述方法成功解决了问题。笔者的应用现在可以以一个普通用户的权限做到以下事情：

1. 创建并运行容器

2. 配置 cgroup 来限制容器

3. 容器结束后读取 cgroup 文件获得各种占用数据
