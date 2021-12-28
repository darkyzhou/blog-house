---
title: 记一次 Kubernetes Pod 资源分配设置不当导致的事故
slug: a-mistake-on-kubernetes-resource-management
date: 2020-12-23T23:42:52.123Z
category: 云原生
tags:
  - Kubernetes
  - DevOps
---

## 背景

笔者最近加入了校内某在线课程平台的运维团队。此运维团队在 on-premise 的私有云上搭建了 Kubernetes 集群来管理服务，包括前后端服务以及数据库、消息队列等基础服务。

最近，由于种种原因，团队管理的供测试环境使用的 Kubernetes 集群需要支撑某研究生团队的 NLP 运算程序。他们每天都会部署数次 Deployment 来运行数十个 Pod 进行计算。运维团队的人员在运算程序的 Deployment 上编写了如下的资源分配设置：

```yaml
resources:
  requests:
    memory: '4096Mi'
    cpu: '4000m'
  limits:
    memory: '8192Mi'
    cpu: '4000m'
```

## 事故的发生

原本整个运维团队对测试环境集群支撑 NLP 运算程序是抱有良好的信心的，直到研究生开始部署程序的当天下午，有人发现测试环境集群中的某个节点状态变为`NotReady`，测试环境集群上运行的一些属于课程平台的服务甚至因此变得不稳定。

在 Kubernetes Control Plane 上运行 kubectl 发现，此节点的 kubelet 毫无反应。使用 SSH 登录故障节点之后发现：操作系统的内存几乎已满，正处于 Out Of Memory(OOM)的临界点中，而罪魁祸首竟然是十多个研究生的运算程序！

## 原因分析

从事故的表象来看，有两个疑点需要我们分析：

1. 为什么 Kubernetes 明明知道 NLP 运算程序的资源消耗情况（上面的资源分配设置），却仍会调度 Pod 导致节点出现 OOM？
2. 为什么节点在面临 OOM 时，kubelet 不开始驱逐 Pod 以释放内存消耗？

笔者结合当时的故障情况，分析并和团队成员讨论之后，初步确定了故障原因如下：

首先，原本的资源分配设置中内存的`request`数目并不合理，我们仔细检查 NLP 运算程序之后发现，它占用的内存长期处于设置中的`request`值和`limit`值之间。这会导致 Kubernetes 在<u>假定 Pod 使用的内存主要处于`request`值附近并且不会突然增大</u>时，尽可能地依据`request`值将更多的 Pod 调度到负载较低的节点上，<u>即使这些 Pod 的`limit`值可能超过了节点能为 Pod 提供的最大值</u>。

其次，由于研究生部署这些运算程序是一次一批，且一批有数十个 Pod**同时**被调度，我们的故障节点碰巧在当时负载较低，于是被调度了非常多的运算程序 Pod，进而导致内存使用在短时间内激增。再加上 Kubernetes 并不知道这些 Pod 使用的内存实际上稍高于`request`值，因此 Pod 的调度直接让操作系统面临 OOM 的风险。

更糟的是，根据[Kubernetes 官方文档](https://kubernetes.io/zh/docs/tasks/administer-cluster/out-of-resource/#kubelet-%E5%8F%AF%E8%83%BD%E6%97%A0%E6%B3%95%E7%AB%8B%E5%8D%B3%E5%8F%91%E7%8E%B0%E5%86%85%E5%AD%98%E5%8E%8B%E5%8A%9B)：

> kubelet 当前通过以固定的时间间隔轮询 cAdvisor 来收集内存使用数据。如果内存使用在那个时间窗口内迅速增长，kubelet 可能不能足够快的发现 MemoryPressure，OOMKiller 将不会被调用。

kubelet 此时仍处于 cAdvisor 汇报异常情况的窗口期，对操作系统已经面临 OOM 风险毫不知情。同时，*或许*是因为数十个 NLP 程序占用了过多的 CPU 时间，导致 kubelet 无法分得足够的时间响应 Kubernetes 控制面的请求，以及对 Pod 进行驱逐以缓解 OOM，最终导致了节点的故障。

## 解决方法

在分析原因之后，团队在讨论下确定了如下的解决方法：

1. 调整 Deployment 的资源分配设置如下：

   ```yaml
   resources:
     requests:
       memory: '8192Mi'
       cpu: '4000m'
     limits:
       memory: '8192Mi'
       cpu: '4000m'
   ```

   我们只将内存的`request`值放大到了`limit`值，这样 Kubernetes 就不会冒险将更多的计算程序 Pod 调度到内存资源不足节点上。这解决了我们上述的第一个疑问。

   当然，将内存`request`值定为与`limit`值相等可能有一些浪费，因为此时该值已经是 Pod 的“死线”，正常运行下 Pod 消耗的内存与该值会存在一定距离。或许我们可以适当降低`request`值，使其<u>仅比 NLP 运算程序稳定运行时稍高一些</u>，这样 Kubernetes 就能更充分地利用集群所有节点的内存资源，正如上文所说，Kubernetes 在调度 Pod 时依据的是`request`值。但这样做的代价是稳定性的下降。

2. 参考如下[Azure 的资源预留配置](https://docs.microsoft.com/zh-cn/azure/aks/concepts-clusters-workloads#resource-reservations)，为 kubelet 设置合理的预留 CPU 和内存资源，防止上述第二个疑问的产生：

   > - **CPU** - 预留的 CPU 取决于节点类型和群集配置，这可能会由于运行其他功能而导致可分配的 CPU 较少
   >
   > | 主机上的 CPU 核心数   | 1   | 2   | 4   | 8   | 16  | 32  | 64  |
   > | :-------------------- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
   > | Kube 预留 (millicore) | 60  | 100 | 140 | 180 | 260 | 420 | 740 |
   >
   > - **内存** - AKS 使用的内存包含两个值的和。
   >
   > 1. Kubelet 守护程序安装在所有 Kubernetes 代理节点上，用于管理容器的创建和停止使用。 在 AKS 上，此守护程序默认具有逐出规则 _memory.available<750Mi_ ，也就是说一个节点必须始终具有至少 750 Mi 的可分配内存。 主机低于该可用内存阈值时，kubelet 将终止某个正在运行的 pod，以释放主机上的内存并对其进行保护。 当可用内存下降到 750Mi 阈值以下时，会触发此操作。
   > 2. 第二个值是为 kubelet 守护程序正常运行而预留（kube 预留）的内存的递减速率。
   >    - 前 4 GB 内存的 25%
   >    - 下一个 4 GB 内存的 20%（最多 8 GB）
   >    - 下一个 8 GB 内存的 10%（最多 16 GB）
   >    - 下一个 112 GB 内存的 6%（最多 128 GB）
   >    - 128 GB 以上任何内存的 2%
   >
   > 上述内存和 CPU 分配规则用于保持代理节点正常运行，包括一些对群集运行状况至关重要的托管系统 Pod。 这些分配规则还会使节点报告的可分配内存和 CPU 少于它不属于 Kubernetes 群集时的正常分配量。 上述资源预留无法更改。
