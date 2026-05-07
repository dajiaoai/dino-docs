---
title: SDK 1.2.1 协议参考
description: 1.2.1 版本 postMessage 协议与错误码定义
---

# SDK 1.2.1 状态与错误码

本文档列出了 SDK 在 1.2.1 版本中可能返回的错误码及其含义。当您调用 SDK 方法（如 `loadShareById`）失败时，可以通过捕获到的错误对象中的 `code` 属性进行判断。

## 错误码表

| 错误码                       | 说明                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| `EMBED_LOAD_SHARE_FAILED`    | 加载远程分享 ID 失败，请检查分享 ID 是否存在或网络连接     |
| `EMBED_LOAD_FILE_FAILED`     | 注入 FileContentV10 内容失败，请校验 JSON 格式是否符合规范 |
| `EMBED_SWITCH_SLIDE_FAILED`  | 切换画板失败                                               |
| `EMBED_INVALID_SLIDE_INDEX`  | 无效的画板索引，通常是索引超出了当前文件的画板总数         |
| `EMBED_INVALID_REPL_COMMAND` | 无效或空白的 REPL 指令                                     |
| `EMBED_UNKNOWN_METHOD`       | 当前版本的内嵌页不支持该操作                               |
| `EMBED_IFRAME_NOT_READY`     | 画板尚未就绪，请在 `ready` 事件触发后再调用 API            |
| `EMBED_TIMEOUT`              | 请求处理超时（默认 30s）                                   |
