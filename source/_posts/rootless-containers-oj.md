---
title: 探索 Rootless Containers：应用于 OJ 的下一代技术
date: 2021-10-11T12:44:40.425Z
category: 'Linux 研究日志'
tags:
  - 容器技术
  - OJ
  - 'Rootless Container'
  - Docker
  - runc
  - libcontainer
excerpt: 在本文中，笔者探索了如何以一个普通用户的身份从镜像的准备到进程的创建，一步步地创建出一个适合运用在 OJ 评测场景的容器环境。
---
### 背景

OJ（Online Judge）是一种向用户提供在线源程序判题服务的系统，广泛用在各种 ACM 赛事以及大学的教学之中。它接受用户提交的程序源代码（通常是 C++ 语言），将它编译并运行，给与特定的输入然后接受程序的输出，最后对比期望的输出来判分。

在这个过程中，为了保证安全性和公平性，OJ 需要保证选手提交的程序满足以下限制：

* 不能对平台以及操作系统造成破坏。
* 不能读取它不该读取的文件，例如标准输入数据。
* 不能通过 IPC 等手段和其它提交的程序通信。
* 如果题目有要求，运行时间或占用内存不得超过要求。
* 公平地利用评测机的 CPU 和内存等资源。

近十年以来，OJ 平台的技术原理经历了多次变革。最近的一次以 Linux 容器技术为支点，主要利用 namespaces、cgroup、seccomp、rlimit 等技术实现上述的限制。实现的具体原理本文不会过多介绍。**需要指出的是，OJ 评测环境和普通的容器相比，包括但不局限于下列的额外要求：**

* 需要限制程序的运行时间，超时时应该中止程序。
* 需要限制程序占用的内存，超出限制时应该中止程序。
* 根据不同评测规则，需要限制程序能够访问的文件。

容器技术能够很好地满足 OJ 平台的需求，同时具有较为良好的性能表现和安全性。不过，大多数使用容器技术实现的 OJ 都没有绕开一个较为突出的不安全因素：root 权限。

对于传统的 Linux 容器技术来说，它们大多都需要用户程序具备特殊权限去操作各种内核提供的接口。以 Docker 为典型的容器管理工具为例，它在安装到系统之后需要运行一个具备 root 权限的后台程序，执行用户对容器操作的请求。Docker 需要 root 权限，这一点在过去的数年间广受争议，因为这成为了针对 Docker 进行恶意攻击的主要突破口之一。

在最近的几年，事情出现了转机：Linux 内核开始将容器技术依赖的部分关键功能的权限限制放宽，使得普通用户也能够操作这些功能。由此，人们提出了 Rootless containers 的概念。在 [rootlesscontaine.rs](https://rootlesscontaine.rs/) 上，人们如此定义它们：

> Rootless containers refers to the ability for an unprivileged user to create, run and otherwise manage containers. This term also includes the variety of tooling around containers that can also be run as an unprivileged user.

也就是说，Rootless containers 指的是普通用户（不具备管理员权限、也不应该具备更多权限）可以创建、运行和管理的容器。在这种情况下，容器技术整体的安全性会更上一层楼。因此，笔者认为它将可能是广泛应用到 OJ 的下一代技术。

### Rootless containers 技术原理

#### 概述

在开始进一步的讨论之前，我们先过一遍 Linux 容器技术的原理。Linux 容器诞生的背景是：人们希望能够给各种程序创造相互隔离的环境，但是不希望使用虚拟机这种太过笨重的解决方案。**因此在笔者看来，容器技术的目标在于：资源的隔离和限制。**

为了实现资源的隔离，Linux 内核提供了**命名空间（namespaces）**。man7.org 如此描述命名空间：

> A namespace wraps a global system resource in an abstraction that makes it appear to the processes within the namespace that they have their own isolated instance of the global resource.  Changes to the global resource are visible to other processes that are members of the namespace, but are invisible to other processes. One use of namespaces is to implement containers.

通过使用各种类型的命名空间，我们可以让不同应用程序之间无法感觉到彼此的存在，让它们都认为自己独自运行在操作系统中，从而实现资源的隔离。

对于资源的限制，Linux 内核提供了 seccomp、cgroup 和 rlimit 技术。前者能够限制应用程序能够进行的系统调用种类。后两者提供了限制应用程序对 CPU、内存的占用、运行的时间甚至是打开的文件数量进行限制的方案。具体信息读者可以参考 man7。

#### 用户命名空间与权限模型

Rootless containers 使用了一种非常关键的命名空间——用户命名空间。它是 Linux 内核对权限控制的抽象。

Linux 内核在 2.2 版本开始将原本简单的权限模型进一步细化，将 root 权限细分为了若干种子权限，成为 compatibilities。在 3.8 版本中完善了**用户命名空间（user namespaces）**，并且让 compatibilities 成为了用户命名空间级别，即不同的用户命名空间可以拥有自己的 compatibilities 组合。同时，用户命名空间是嵌套的。除了**初始用户命名空间（initial user namespace）**以外，所有的用户命名空间都有自己的父节点。创建一个用户命名空间的进程就位于它的父节点。

嵌套的用户命名空间还遵守一些特殊的 compatibility 计算规则，其中最值得注意的两条是：

* 如果一个进程在一个用户命名空间里有某个 compatibility，那么前者在后者的所有子用户命名空间里都拥有这个 compatibility。
* 当一个用户命名空间被建立的时候，内核会记下创建它的程序的**等效用户 ID（effective user ID）**，将它作为创建出来的用户命名空间的**所有者（owner）**。这个程序同时也会拥有创建出来的用户命名空间的所有 compatibilities。

让 compatibilities 成为用户命名空间级别意味着：在某个用户命名空间里，**即使应用程序拥有所有 compatibility，它也只能对当前用户命名空间或其管辖的命名空间的资源进行操作**。对于那些和特定命名空间无关的操作，比如修改时间、加载内核模块，这些操作只能在初始用户命名空间里具备 `CAP_SYS_TIME` 或 `CAP_SYS_MODULE` compatibility 才能进行。因为它们可能对其它用户命名空间造成影响，破坏了命名空间的隔离性质。

现在我们知道了 Linux 内核在引入用户命名空间之后的权限模型。原本的 root 权限被细分为多个 compatibility 之后，通过引入的用户命名空间而层次化。只有初始用户命名空间的具备所有 compatibility 的进程具有在整个系统看来最大的权利，因为它具有影响系统上所有用户命名空间的权限。子用户命名空间也有可能操作父空间的资源，关键在于 UID 和 GID 的映射，这里由于篇幅原因略过。

最后，同样是在 3.8 版本开始，内核允许没有特殊权限的进程创建用户命名空间。并且只要在创建的用户命名空间里具有 `CAP_SYS_ADMIN` compatibility，也能够创建其他类型的命名空间。**如果想要控制其他类型命名空间里的系统资源，只需要在管辖它的用户命名空间里具备相应的 compatibility 即可。**笔者认为这是具有深远意义的改进。我们来看看 man7 里的这段话：

> Over the years, there have been a lot of features that have been added to the Linux kernel that have been made available only to privileged users because of their potential to confuse set-user- ID-root applications.  In general, it becomes safe to allow the root user in a user namespace to use those features because it is impossible, while in a user namespace, to gain more privilege than the root user of a user namespace has.

近几年 Linux 内核开发者们逐渐明确了一个观念：内核里的很多功能其实可以给用户命名空间里面具备权限的程序去用。这些用户命名空间是由普通用户创建的。其实说到底，为什么非得限制只有权限用户才能利用内核的一些功能呢？无非是担心不同用户之间会相互造成不良影响。上面讲到的权限细分化、层次化已经很好地解决了这个问题。

只要用户程序在创建出来的用户命名空间里拥有 `CAP_SYS_ADMIN` 权限，它就能创建被当前用户命名空间所管辖的**挂载命名空间（mount namespace）**、**IPC 命名空间（IPC namespace）**等。从 Linux 内核 4.6 版本开始，它还能挂载 cgroup v2 的文件系统以及 cgroup v1 的 named hierarchies。从 Linux 内核 5.11 版本开始，它还能挂载 overlayfs 文件系统。同样，只要在用户命名空间里具备合适的 compatibility，用户程序也能配置 seccomp 和 rlimit。

至此我们发现在新版本的 Linux 内核里，普通用户已经完全具备创建容器的能力，前面讲到的资源的隔离和限制所需的功能都可以被普通用户调用。

#### 其他命名空间

Linux 内核的命名空间体系除了用户命名空间以外，还包含以下命名空间。它们的目的都是为了隔离系统的资源，但管辖的资源种类不同。

* Cgroup 命名空间（Cgroup namespaces）。隔离不同进程的 cgroup 配置根文件夹。
* IPC 命名空间（IPC namespaces）。隔离进程对 System V IPC 和 POSIX 消息队列的访问。
* 网络命名空间（Network namespaces）。隔离进程使用的网络栈、网络设备、端口等。通过隔离网络命名空间，可以在同一个 Linux 系统里运行多个同样监听 80 端口的 Nginx 实例。
* 挂载命名空间（Mount namespaces）。隔离进程看到的挂载点。一般会结合使用 pivot_root 为容器创造一个完全隔离的文件系统环境，也就是说不同的容器看到的根目录以及下面的各种文件，以及部分挂载点都是完全不同的。这也是容器镜像的实现方法。
* PID 命名空间（PID namespaces）。隔离进程的进程 ID 空间，这可以让位于不同的进程命名空间的进程拥有相同的 PID。
* 时间命名空间（Time namespaces）。隔离进程得到的系统时钟时间。
* UTS 命名空间（UTS namespaces）。主要是隔离进程看到的 hostname。

对于在 Docker 上运行的大多数容器程序来说，一般只会用到上述的 IPC 命名空间、网络命名空间、挂载命名空间、PID 命名空间和 UTS 命名空间，而且不会用到用户命名空间。因为对于这些容器里跑的程序而言，隔离这几个命名空间就已经足以保障资源的隔离了。

上文提到如果是不具备特殊权限的进程，只能先新建一个用户命名空间，然后再在这个命名空间里进一步创建挂载命名空间、IPC 命名空间等。因此，相比传统的依靠 root 权限的容器创建方法，我们需要额外进行一些步骤。

### Rootless containers 的创建

接下来，笔者将尝试使用上述技术在当前用户为普通用户（UID 为 1000）的情况下，搭建一个能够满足 OJ 平台需要的评测环境。搭建环境的具体过程和 OCI Runtime 规范的参考实现 [runc](https://github.com/opencontainers/runc) 类似，只不过为了方便说明，我转而使用了和相关系统调用等价或同名的一些系统工具。

> 笔者使用的发行版是 Ubuntu 21.10 测试版，在这个版本中 Ubuntu 默认开启了 Cgroup V2，并且使用较新的 5.13 版本内核。笔者也在运行着 Ubuntu 20.04（内核版本 5.4.0）的树莓派上尝试了下文的命令，均能正常工作。

#### 准备容器环境

容器需要运行在一个独立的环境中，这意味着需要为镜像准备一个操作系统的文件镜像，在这里我选择了 CentOS 的容器镜像。我们可以使用 skopeo 工具来从符合 API V2 container image 的 registry（比如 docker.io）中下载容器镜像并解开成符合 OCI 标准的文件夹。然后使用 umoci 工具将文件夹转换为 runc 可以直接使用的容器根文件夹。

> 使用 umoci 工具之后，我们实际上已经可以通过 runc 来创建需要的容器环境了，不过为了展示其中的原理，我们继续研究如何一步步地创建。在本节的最后会详细介绍 umoci 为 runc 生成的配置文件。

使用 umoci 的原因是：它为 rootless containers 提供了支持，能够让普通用户解压镜像文件，这对于很多同类工具来说是做不到的。umoci 还能为镜像生成对应的配置，使其能够被 runc 以 rootless container 的模式启动容器。

```
darkyzhou@dev ~> skopeo copy docker://docker.io/library/centos:latest oci:/tmp/centos:latest
darkyzhou@dev ~> umoci unpack --rootless --image /tmp/centos:latest centos
   • rootless{usr/bin/newgidmap} ignoring (usually) harmless EPERM on setxattr "security.capability"
   • rootless{usr/bin/newuidmap} ignoring (usually) harmless EPERM on setxattr "security.capability"
   • rootless{usr/bin/ping} ignoring (usually) harmless EPERM on setxattr "security.capability"
   • rootless{usr/sbin/arping} ignoring (usually) harmless EPERM on setxattr "security.capability"
   • rootless{usr/sbin/clockdiff} ignoring (usually) harmless EPERM on setxattr "security.capability"
darkyzhou@dev ~> ls centos/rootfs/
bin@  dev/  etc/  home/  lib@  lib64@  lost+found/  media/  mnt/  opt/  proc/  root/  run/  sbin@  srv/  sys/  tmp/  usr/  var/
```

> 在使用 umoci 时，它报了一些警告。[根据 umoci 官方文档](https://umo.ci/quick-start/rootless/)，这些警告可以安全地忽略。umoci 在 rootless 模式下创建的系统镜像文件并不会和 root 模式下创建的一样，这是因为操作系统限制普通用户创建一些特殊设备的 inode 以及一些 set-uid 的二进制文件。

可以看到，我们得到的 `centos/rootfs` 文件夹的内容就是一个普通的 Linux 发行版的根文件夹。根文件夹的作用如 [runc 文档](https://github.com/opencontainers/runc/blob/master/libcontainer/SPEC.md#filesystem) 所述：

> A root filesystem must be provided to a container for execution. The container will use this root filesystem (rootfs) to jail and spawn processes inside where the binaries and system libraries are local to that directory. Any binaries to be executed must be contained within this rootfs.

接下来将使用挂载命名空间，将容器的运行环境锁定在这个文件夹中，让容器内部的进程认为此文件夹就是 `/`。不过，此文件夹目前还缺少了几件必须的东西。

根据 [OCI Runtime 规范](https://github.com/opencontainers/runtime-spec/blob/master/config-linux.md)，Linux ABI 下的应用程序会期望 Linux 环境提供以下特殊的文件系统：

* `/proc` 文件夹，挂载 `proc` 文件系统。
* `/sys` 文件夹，挂载 `sysfs` 文件系统。
* `/dev/pts` 文件夹，挂载 `devpts` 文件系统。
* `/dev/shm` 文件夹，挂载 `tmpfs` 文件系统。

这几个文件夹的作用这里略去，有兴趣的读者可以自行查阅 man7.org。[runc 文档](https://github.com/opencontainers/runc/blob/master/libcontainer/SPEC.md#filesystem)中还额外要求提供：

* `/dev` 文件夹，挂载 `tmpfs` 文件系统。
* `/dev/mqueue` 文件夹，挂载 `mqueue` 文件系统。

OCI Runtime 规范还提到，Linux 环境还需要提供以下的设备文件或符号链接：

- [`/dev/null`](http://man7.org/linux/man-pages/man4/null.4.html)
- [`/dev/zero`](http://man7.org/linux/man-pages/man4/zero.4.html)
- [`/dev/full`](http://man7.org/linux/man-pages/man4/full.4.html)
- [`/dev/random`](http://man7.org/linux/man-pages/man4/random.4.html)
- [`/dev/urandom`](http://man7.org/linux/man-pages/man4/random.4.html)
- [`/dev/tty`](http://man7.org/linux/man-pages/man4/tty.4.html)
- `/dev/console` is set up if [`terminal`](https://github.com/opencontainers/runtime-spec/blob/master/config.md#process) is enabled in the config by bind mounting the pseudoterminal pty to `/dev/console`.
- [`/dev/ptmx`](http://man7.org/linux/man-pages/man4/pts.4.html). A [bind-mount or symlink of the container's `/dev/pts/ptmx`](https://www.kernel.org/doc/Documentation/filesystems/devpts.txt).

除此之外，[runc 文档](https://github.com/opencontainers/runc/blob/master/libcontainer/SPEC.md#filesystem)还建议设置 `/dev/fd` 等符号链接，以及 `/etc/hosts` 等文件。

接下来读者将看到：为了完成上述需求，需要为根文件夹创建一个挂载点，然后在这个挂载点的基础上挂载上面要求的文件系统以及设备。对于不同的文件系统和不同的设备，处理方法并不一致。

#### 创建用户命名空间

通过 `unshare -Ur` 命令建立用户命名空间。`-U` 选项的含义是创建命名空间，`-r` 选项的含义是自动将新命名空间的 `root` 用户（也即 UID 为 `0` 的用户）映射到原命名空间里执行命令的用户上。之后，由于没有指定命令，`unshare` 会自动启动 `$BASH` 对应的 bash 程序。

> 笔者使用了 fish shell，它会在启动时打印两行如下所示的信息。

```
darkyzhou@dev ~> unshare -Ur
Welcome to fish, the friendly interactive shell
Type `help` for instructions on how to use fish
root@dev ~#
```

我们竟然从一个普通用户变成了 `root` ，这可比 `sudo -i` 刺激多了。可是如果随便输入一些原来的普通用户没有权限做的命令，例如 `apt update`，我们会得到：

```
root@ubuntu:~# apt update
Reading package lists... Done
...
E: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)
E: Unable to lock directory /var/lib/apt/lists/
W: Problem unlinking the file /var/cache/apt/pkgcache.bin - RemoveCaches (13: Permission denied)
W: Problem unlinking the file /var/cache/apt/srcpkgcache.bin - RemoveCaches (13: Permission denied)
```

我们依然没有权限。这证明了切换到的 `root` 用户仅对新建的用户命名空间所管辖的资源有效，不过现在还没有创建任何资源。

#### 创建其他命名空间

我们已经通过 `unshare -Ur` 得到了一个位于新用户命名空间中运行的 bash 进程，但它的挂载命名空间依然是初始命名空间。可以再输入 `unshare -m` 来创建挂载命名空间。不过为了避免麻烦，先通过 `exit` 退出刚才的 bash，进而也就退出了用户命名空间（内核会自动回收不再使用的命名空间）；然后通过给 `unshare` 传递多个参数一次性地创建需要的几个命名空间。

```
ubuntu@ubuntu:~$ unshare -Urmipun --fork
root@ubuntu:~# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/mmcblk0p2   29G  9.1G   19G  33% /
udev            1.9G     0  1.9G   0% /dev
tmpfs           1.9G     0  1.9G   0% /dev/shm
tmpfs           380M  4.2M  376M   2% /run
tmpfs           5.0M     0  5.0M   0% /run/lock
...
```

我们通过上述的几个参数创建了：用户命名空间、挂载命名空间、IPC 命名空间、PID 命名空间、UTS 命名空间和网络命名空间。进入新的挂载命名空间之后，由于 Linux 内核默认会将原来的命名空间里的挂载点信息复制到新的挂载命名空间里，因此通过 `df -h` 看到的挂载点和进入之前是一样的。

接下来为上面准备的根文件夹创建挂载点：

```
root@dev ~/centos# cd centos/rootfs/
root@dev ~/c/rootfs# mount --rbind . .
```

这里的作用是给当前挂载树建立一个 `~/rootfs` 的节点。可以使用 `findmnt` 来印证这一点：

```
root@dev ~/c/rootfs# findmnt
TARGET                          SOURCE                      FSTYPE     OPTIONS
/                               /dev/mapper/ubuntu--vg-ubuntu--lv
│                                                           ext4       rw,relatime
├─省略中间内容
└─/home/darkyzhou/centos/rootfs /dev/mapper/ubuntu--vg-ubuntu--lv[/home/darkyzhou/centos/rootfs]
                                                            ext4       rw,relatime
```

可以看到，我们的文件夹在挂载树上对应了一个挂载点节点。

接下来，为此挂载点添加必须的一些文件系统：

```
root@dev ~/c/rootfs# export NEW_ROOT=/home/darkyzhou/centos/rootfs
root@dev ~/c/rootfs# mount -t proc -o noexec,nosuid,nodev proc $NEW_ROOT/proc
root@dev ~/c/rootfs# mount -t tmpfs -o noexec,strictatime,mode=0755 dev $NEW_ROOT/dev
root@dev ~/c/rootfs# mkdir $NEW_ROOT/dev/shm
root@dev ~/c/rootfs# mount -t tmpfs -o noexec,nosuid,nodev,mode=1777,size=65536k shm $NEW_ROOT/dev/shm
root@dev ~/c/rootfs# mkdir $NEW_ROOT/dev/mqueue
root@dev ~/c/rootfs# mount -t mqueue -o noexec,nosuid,nodev mqueue $NEW_ROOT/dev/mqueue
root@dev ~/c/rootfs# mount -t sysfs -o noexec,nosuid,nodev,ro sys $NEW_ROOT/sys
root@dev ~/c/rootfs# mkdir $NEW_ROOT/dev/pts
root@dev ~/c/rootfs# mount -t devpts -o noexec,nosuid,newinstance,ptmxmode=0666,mode=620 devpts $NEW_ROOT/dev/pts
```

这里最后一个挂载 `devpts` 的命令按照 runc 的文档解释，应该加一个 `gid=5` 的选项，但笔者尝试之后得到了以下的报错：

```
mount: /home/ubuntu/new_root/dev/pts: wrong fs type, bad option, bad superblock on devpts, missing codepage or helper program, or other error.
```

笔者参考[一个可能有关的 issue](https://github.com/opencontainers/runc/issues/225)，取消了选项 `gid=5` 后挂载成功。目前尚不明确原因，可能与笔者是在一个已经打开了伪终端的 bash 进程中进行操作有关。

除了文件系统，还要准备以下设备文件：

```
root@dev ~/c/rootfs# touch $NEW_ROOT/dev/{null,zero,full,tty,random,urandom}
root@dev ~/c/rootfs# mount --bind /dev/null $NEW_ROOT/dev/null
root@dev ~/c/rootfs# mount --bind /dev/zero $NEW_ROOT/dev/zero
root@dev ~/c/rootfs# mount --bind /dev/full $NEW_ROOT/dev/full
root@dev ~/c/rootfs# mount --bind /dev/tty $NEW_ROOT/dev/tty
root@dev ~/c/rootfs# mount --bind /dev/random $NEW_ROOT/dev/random
root@dev ~/c/rootfs# mount --bind /dev/urandom $NEW_ROOT/dev/urandom
root@dev ~/c/rootfs# ln -s /dev/ptmx $NEW_ROOT/dev/ptmx
root@dev ~/c/rootfs# ln -s /proc/self/fd $NEW_ROOT/dev/fd
root@dev ~/c/rootfs# ln -s /proc/self/fd/0 $NEW_ROOT/dev/stdin
root@dev ~/c/rootfs# ln -s /proc/self/fd/1 $NEW_ROOT/dev/stdout
root@dev ~/c/rootfs# ln -s /proc/self/fd/2 $NEW_ROOT/dev/stderr
```

> 对于 Docker 容器，如果用户使用 `-v` 参数向容器内部挂载一个文件夹，那么实际上 Docker 做的事情和这里是差不多的，也是通过 `mount` 将文件夹重新挂载到容器中。

在需要 root 权限的容器创建流程中，这一步是通过 `mknod` 系统调用或同名的命令去完成的。但此系统调用需要初始命名空间的 root 权限，不能在 rootless container 中使用，因此我们只能直接将宿主的设备文件 `mount` 进容器中。

```
root@dev ~/c/rootfs# cd
root@dev ~# mkdir $NEW_ROOT/old_root
root@dev ~# pivot_root $NEW_ROOT $NEW_ROOT/old_root/
root@dev ~# cd /
root@dev /# umount -l old_root/
root@dev /# rm -r old_root/
root@dev /# exec bash
bash-4.4# PS1='my-container => '
my-container =>
```

`pivot_root` 命令将当前挂载命名空间的**根节点**切换到了 `~/rootfs` 之中，同时将原本的根节点绑定到了 `old_root/` 上。由于我们不再需要原本的根节点，可以对其进行 `umount`。我们在 `cd /` 之后就已经切换到了新容器的根文件系统中。笔者在最后手动输入 `exec bash` 来让当前运行的 fish shell 进程（来自宿主系统）切换为 bash shell 进程（来自 CentOS 容器），因为 fish shell 进程本身保留着一些来自容器外部的宿主系统的数据，在容器中运行容易出现各种奇怪的错误。

> 读者可能听过 `chroot`。看上去它和 `pivot_root` 一样都能改变根文件夹，但实际上它们的原理的完全不同的。前者做的事情只是修改新进程的 PWD。根据 [man7.org](https://man7.org/linux/man-pages/man8/pivot_root.8.html)，像上面这样 `pivot_root` 之后最好使用 `exec chroot . sh <dev/console >dev/console 2>&1` 这样的命令来脱离原来的 fish shell。因此上面的命令最好改为：
>
> ```
> root@dev ~# pivot_root $NEW_ROOT $NEW_ROOT/old_root/
> root@dev ~# cd /
> root@dev /# exec chroot . sh <dev/console >dev/console 2>&1
> bash-4.4# umount /old-root
> ```

```
my-container => ls
bin@  dev/  etc/  home/  lib@  lib64@  lost+found/  media/  mnt/  old_root/  opt/  proc/  root/  run/  sbin@  srv/  sys/  tmp/  usr/  var/
my-container => cat /etc/centos-release
CentOS Linux release 8.4.2105
```

从 `/etc/centos-release` 的内容可以印证，我们已经从 Ubuntu 宿主系统切换到了 CentOS容器中。

```
my-container => findmnt
TARGET           SOURCE                                                           FSTYPE   OPTIONS
/                /dev/mapper/ubuntu--vg-ubuntu--lv[/home/darkyzhou/centos/rootfs] ext4     rw,relatime
|-/proc          proc                                                             proc     rw,nosuid,nodev,noexec,relatime
|-/dev           dev                                                              tmpfs    rw,noexec,mode=755,uid=1000,gid=1000,inode64
| |-/dev/shm     shm                                                              tmpfs    rw,nosuid,nodev,noexec,relatime,size=65536k,uid=1000,gid=1000,inode64
| |-/dev/mqueue  mqueue                                                           mqueue   rw,nosuid,nodev,noexec,relatime
| |-/dev/pts     devpts                                                           devpts   rw,nosuid,noexec,relatime,mode=620,ptmxmode=666
| |-/dev/null    udev[/null]                                                      devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
| |-/dev/zero    udev[/zero]                                                      devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
| |-/dev/full    udev[/full]                                                      devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
| |-/dev/tty     udev[/tty]                                                       devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
| |-/dev/random  udev[/random]                                                    devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
| `-/dev/urandom udev[/urandom]                                                   devtmpfs rw,nosuid,relatime,size=8158036k,nr_inodes=2039509,mode=755,inode64
`-/sys           sys                                                              sysfs    ro,nosuid,nodev,noexec,relatime
```

从 `findmnt` 的输出来看，我们的挂载树已经和宿主系统的挂载树完全不同了。在这种环境下工作的程序无法感知到容器外部的宿主系统。

#### 设置 cgroup、rlimit 和 seccomp

OJ 环境相比普通的容器环境来说，对 cgroup、rlimit 和 seccomp 的使用有着更为严格的要求。如本文开头所说，OJ 环境中需要限制程序的运行时间、占用内存以及文件访问等。

在建立好命名空间并通过 `pivot_root` 切换根挂载点之后，我们得到了一个位于这种环境中运行的 PID 为 1 的进程，在上面的例子中它是 `bash`。像 runc 这样的容器运行时会让它自己 `fork()` 之后的子进程成为新命名空间里 PID 为 1 的进程，然后再设置 cgroup、rlimit 和 seccomp，之后才会通过 `execvp()` 运行容器真正需要跑的程序。这是因为这几个功能必须作用到正在运行的进程上。

rlimit 和 seccomp 相关的系统调用不需要特殊权限，因此在 Rootless container 的环境下可以正常使用。但是 cgroup 的情况则要复杂一些。

cgroup 目前有 v1 和 v2 两个版本。目前使用最为广泛的是前者，而后者虽然诞生至今快十年但并不太稳定，许多发行版直到最近的几个版本才将它默认开启（Ubuntu 直到 21.10 版本才默认将它开启）。

对 cgroup 的配置方法是将它对应的 `cgroup` 文件系统进行挂载之后修改其中的文件。对于大多数使用 systemd 的发行版来说，此文件系统默认会被自动挂载到 `/sys/fs/cgroup` 上。

在 cgroup v1 中，如果需要让普通用户操作 cgroup，笔者只能找到两种办法：

1. `root` 用户在 `/sys/fs/cgroup` 对应的 controller 文件夹里新建一个文件夹，将它 `chown` 为普通用户。这样此普通用户就能使用这个 controller 对应的 group 了。此方法对于 Rootless containers 的情况是行不通的，按照定义它不应该由 `root` 用户介入工作。
2. 通过 delegation 将 controller 交给普通用户使用。这种方法[据称并不安全](https://rootlesscontaine.rs/how-it-works/cgroups/#v1)。

由此看来，我们的希望只能寄托到 cgroup v2 上。据 [rootlesscontaine.rs](https://rootlesscontaine.rs/getting-started/common/cgroup2/) 所说，cgroup v2 原生支持让普通用户使用 cgroup，且一般会通过 systemd 作为 delegation 让普通用户得以操作 cgroup。

具体的过程这里由于篇幅原因不再使用具体的程序、代码展示。我们在后文会使用 runc 来完成 rootless container 的整套创建流程。

#### 其他设置

为了简便，也因为对应的设置不能通过简单的命令行工具完成，我们在上述过程中省略了很多较为重要的容器设置。例如 [ `no_new_privs`](https://www.kernel.org/doc/Documentation/prctl/no_new_privs.txt) 这个涉及容器安全性的设置。又如，需要屏蔽容器内部对 `/proc/kcore` 的访问。在实践中，容器运行时会通过各种复杂的系统调用完成这些设置。

#### 使用 runc 创建 rootless container

runc 是 OCI Runtime 规范的参考实现，规范为容器的创建提供了整洁的接口，只需要为 runc 提供一份 `config.json` 以及根目录文件夹就能让它代为完成上述的一系列步骤，最终创建出一个满足 OJ 环境需要的 rootless container。

笔者在本节开头提到，umoci 工具能自动为 runc 生成一份 rootless container 的运行配置，它的内容如下所示：

```js
{
  "ociVersion": "1.0.0",
  // 此项描述的是初始进程（PID 为 1）的各种设置
  "process": {
    "terminal": true,
    "user": {
      "uid": 0,
      "gid": 0
    },
    "args": [
      "/bin/bash"
    ],
    // 一些基本的环境变量
    "env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "TERM=xterm",
      "HOME=/root"
    ],
    "cwd": "/",
    // compatibility 配置
    "capabilities": {
      "bounding": [
        "CAP_AUDIT_WRITE",
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE"
      ],
      "effective": [
        "CAP_AUDIT_WRITE",
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE"
      ],
      "inheritable": [
        "CAP_AUDIT_WRITE",
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE"
      ],
      "permitted": [
        "CAP_AUDIT_WRITE",
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE"
      ],
      "ambient": [
        "CAP_AUDIT_WRITE",
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE"
      ]
    },
    // rlimit 配置
    "rlimits": [
      {
        "type": "RLIMIT_NOFILE",
        "hard": 1024,
        "soft": 1024
      }
    ],
    // 这是一项很重要的设置，与安全有关，具体可见：
    // https://www.kernel.org/doc/Documentation/prctl/no_new_privs.txt
    "noNewPrivileges": true
  },
  "root": {
    "path": "rootfs"
  },
  "hostname": "umoci-default",
  // 这里的挂载配置与前文说的差不多，都是一些重要的文件系统
  "mounts": [
    {
      "destination": "/proc",
      "type": "proc",
      "source": "proc"
    },
    {
      "destination": "/dev",
      "type": "tmpfs",
      "source": "tmpfs",
      "options": [
        "nosuid",
        "strictatime",
        "mode=755",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/pts",
      "type": "devpts",
      "source": "devpts",
      "options": [
        "nosuid",
        "noexec",
        "newinstance",
        "ptmxmode=0666",
        "mode=0620"
      ]
    },
    {
      "destination": "/dev/shm",
      "type": "tmpfs",
      "source": "shm",
      "options": [
        "nosuid",
        "noexec",
        "nodev",
        "mode=1777",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/mqueue",
      "type": "mqueue",
      "source": "mqueue",
      "options": [
        "nosuid",
        "noexec",
        "nodev"
      ]
    },
    {
      "destination": "/sys",
      "type": "bind",
      "source": "/sys",
      "options": [
        "rbind",
        "nosuid",
        "noexec",
        "nodev",
        "ro"
      ]
    },
    {
      "destination": "/etc/resolv.conf",
      "type": "bind",
      "source": "/etc/resolv.conf",
      "options": [
        "nodev",
        "noexec",
        "nosuid",
        "rbind",
        "ro"
      ]
    }
  ],
  // 这些设置只是为了标识
  "annotations": {
    "org.label-schema.build-date": "20210915",
    "org.label-schema.license": "GPLv2",
    "org.label-schema.name": "CentOS Base Image",
    "org.label-schema.schema-version": "1.0",
    "org.label-schema.vendor": "CentOS",
    "org.opencontainers.image.architecture": "amd64",
    "org.opencontainers.image.author": "",
    "org.opencontainers.image.created": "2021-09-15T18:20:05.184694267Z",
    "org.opencontainers.image.exposedPorts": "",
    "org.opencontainers.image.os": "linux",
    "org.opencontainers.image.stopSignal": ""
  },
  "linux": {
    // 下面两个 mapping 是使用用户命名空间的关键
    // 它将容器内的 0 号 PID 和 GID 映射到宿主系统的普通用户和用户组
    "uidMappings": [
      {
        "containerID": 0,
        "hostID": 1000,
        "size": 1
      }
    ],
    "gidMappings": [
      {
        "containerID": 0,
        "hostID": 1000,
        "size": 1
      }
    ],
    // umoci 默认只创建了以下五个命名空间
    // 值得注意的是它并没有创建网络命名空间，因此容器创建之后可以正常上网
    // 这是因为容器和宿主系统使用的网络栈、网卡等都是一样的
    // 但需要注意，容器内部需要提供正确的 /etc/resolv.conf 文件
    "namespaces": [
      {
        "type": "pid"
      },
      {
        "type": "ipc"
      },
      {
        "type": "uts"
      },
      {
        "type": "mount"
      },
      {
        "type": "user"
      }
    ],
    // 以下文件被设置为不可读，主要是为了安全和隔离性考虑
    // 例如，/proc/kcore 文件代表了系统的物理文件，使得容器内部有可能访问到不属于容器的内存
    // 此文件默认会被上面 mount 的 proc 文件系统提供，因此这里需要屏蔽掉，故称为“masked”
    "maskedPaths": [
      "/proc/kcore",
      "/proc/latency_stats",
      "/proc/timer_list",
      "/proc/timer_stats",
      "/proc/sched_debug",
      "/sys/firmware",
      "/proc/scsi"
    ],
    // 以下文件被设置为只读（不可修改），它们主要是一些内核的信息
    // 不同容器之间共享同一个内核，因此将它们设置为不可修改是为了防止容器之间相互影响
    "readonlyPaths": [
      "/proc/asound",
      "/proc/bus",
      "/proc/fs",
      "/proc/irq",
      "/proc/sys",
      "/proc/sysrq-trigger"
    ]
  }
}
```

上述默认生成的配置可以让我们以普通用户的身份创建一个 CentOS 容器：

```
darkyzhou@dev ~> runc run -b centos/ my-container
[root@umoci-default /]#
```

但是它并不能满足我们对 OJ 评测环境的需要，必须做出以下修改：

* 需要创建网络命名空间，隔绝容器对网络的访问。并且最好**不在容器的网络命名空间中提供网卡，包括 lookback 网卡。**这样做能够防止用户提交的评测代码做出一些有害行为。
* 需要去除所有 `compatibility` 的设置，不应该给予评测代码任何特殊权限。
* 需要将用户修改为 `nobody`，尽可能减少评测代码的权限。
* 需要配置 cgroup、seccomp、rlimit 等。

关于 OJ 评测环境的容器的具体配置方法，笔者将在一篇新的文章中继续讨论。

**值得一提的是：即使本身已经处在一个普通容器（具备默认设置的普通权限）中时，runc 依然可以创建容器。**这意味着我们可以将 OJ 平台本身部署到容器中，甚至让整个 OJ 平台运行在 Kubernetes 这样的容器编排平台上，进而充分利用 Kubernetes 带来的高可用性、伸缩性和便捷性。


