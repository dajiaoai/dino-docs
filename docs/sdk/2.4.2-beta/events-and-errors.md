---
title: SDK 2.4.2-beta 事件与错误
description: 了解新版 SDK 的 ready、save、contentChange 等事件语义，以及错误处理方式
---

# SDK 2.4.2-beta 事件与错误

## 事件语义

当前新版文档重点涉及以下事件类别：

| 事件            | 含义                                               |
| --------------- | -------------------------------------------------- |
| `ready`         | iframe 初始化完成，可开始调用实例方法              |
| `save`          | 编辑模式下宿主参与保存流程                         |
| `contentChange` | 设计上用于表达 iframe 内真实用户编辑带来的内容变化 |
| `slideChange`   | 设计上用于表达 iframe 内真实用户切页行为           |

## 语义边界

- `contentChange` 与 `slideChange` 不应由 SDK 主动调用的方法伪造触发。
- 这两类事件应代表 iframe 内真实用户行为，并依赖 iframe 侧显式回传事件消息。

## 错误处理

基础错误码与通信错误语义可参考：

- [旧版协议说明](../../api/protocol)

在业务中建议统一处理以下几类错误：

- iframe 未 ready 即调用
- 参数不合法或内容结构不合法
- 请求超时
- beta 范围内的未对齐能力调用失败
