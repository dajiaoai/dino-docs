---
title: 协议说明
description: FileContentV10 结构、错误码 - 大角几何开放平台
---

# 协议说明

本文档描述大角几何内嵌画板与父页面之间的 postMessage 通信协议。

类型定义（如 `FileContent`、`Slide` 等）请见 [algeo-protocol 仓库](https://github.com/dajiaoai/algeo-protocol)。

## 错误码（内嵌通信协议）

| 错误码                         | 说明                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `EMBED_LOAD_SHARE_FAILED`      | 加载分享失败（分享不存在、解析失败等，loadShareById） |
| `EMBED_LOAD_FILE_FAILED`       | 加载文件失败（文件内容无效，loadFile）                |
| `EMBED_APPLY_CONTENT_FAILED`   | 应用内容到画板失败                                    |
| `EMBED_SWITCH_SLIDE_FAILED`    | 切换画板失败                                          |
| `EMBED_INVALID_SLIDE_INDEX`    | 无效的画板索引                                        |
| `EMBED_GET_SLIDE_COUNT_FAILED` | 获取画板数量失败                                      |
| `EMBED_INVALID_REPL_COMMAND`   | 无效的 REPL 命令（空或非字符串）                      |
| `EMBED_REPL_EXECUTE_FAILED`    | REPL 执行失败                                         |
| `EMBED_UNKNOWN_METHOD`         | 未知的 postMessage 方法                               |
| `EMBED_UNKNOWN_ERROR`          | 未知错误                                              |
| `EMBED_BAD_REQUEST`            | 错误请求                                              |
| `EMBED_IFRAME_NOT_READY`       | iframe 未就绪                                         |
| `EMBED_TIMEOUT`                | 请求超时                                              |
| `EMBED_DESTROYED`              | 实例已销毁                                            |
