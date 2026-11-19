---
title: SDK 错误码
description: 查阅内嵌 SDK 和画板返回的错误码，包括 SDK 1.2.1 文档中的错误码。
---

# SDK 错误码

读取 SDK 异常的 `code`。表中同时列出 SDK 自身、内嵌页和旧版 1.2.1 文档中的错误码。同一行的两个值应按实际返回的字符串匹配。

| 错误码 | 含义 |
| --- | --- |
| `EMBED_MISSING_APP_ID` | 初始化编辑器时缺少 `appId`。 |
| `EMBED_BAD_REQUEST` / `BAD_REQUEST` | 参数或配置无效。 |
| `EMBED_IFRAME_NOT_READY` | iframe 尚未就绪。初始化完成后再调用。 |
| `EMBED_TIMEOUT` | 初始化或请求超时，默认超时为 30 秒。 |
| `EMBED_DESTROYED` | SDK 实例已销毁，或在等待响应期间被销毁。 |
| `EMBED_LOAD_SHARE_FAILED` | 加载远程分享失败。检查分享 ID 或网络连接。 |
| `EMBED_LOAD_FILE_FAILED` | 加载工程文件失败。检查工程 JSON 格式。 |
| `EMBED_APPLY_CONTENT_FAILED` | 应用工程内容失败。 |
| `LOAD_FAILED` | 分享内容不存在或无法解析，或传入的工程文件无效。 |
| `LOAD_CONTENT_FAILED` | 内嵌画板未能载入工程内容。 |
| `GET_CONTENT_FAILED` | 读取工程内容失败。 |
| `EMBED_SWITCH_SLIDE_FAILED` / `SWITCH_SLIDE_FAILED` | 切换画板失败。 |
| `EMBED_INVALID_SLIDE_INDEX` / `INVALID_SLIDE_INDEX` | 画板索引无效或越界。 |
| `EMBED_GET_SLIDE_COUNT_FAILED` / `GET_SLIDE_COUNT_FAILED` | 读取画板数量失败。 |
| `EMBED_INVALID_REPL_COMMAND` / `INVALID_REPL_COMMAND` | REPL 指令为空或格式无效。 |
| `EMBED_REPL_EXECUTE_FAILED` / `REPL_EXECUTE_FAILED` | REPL 指令执行失败。 |
| `SET_MASTER_TEMPLATE_FAILED` | 应用系统母版失败。 |
| `FONT_LOAD_FAILED` | 字体加载失败。 |
| `UNSUPPORTED_CAMERA_MODE` | 目标画板类型不支持所请求的相机模式。 |
| `INVALID_VIEW_CAMERA_3D` | 3D 视图相机参数无效。 |
| `INVALID_VIEW_BOUNDS` | 画板视图边界无效。 |
| `EXPORT_IMAGE_FAILED` | 图片或 TikZ 导出失败。 |
| `INVALID_HISTORY_INDEX` | 历史记录索引无效。 |
| `EMBED_UNKNOWN_METHOD` / `UNKNOWN_METHOD` | 内嵌页不支持当前方法。 |
| `EMBED_UNKNOWN_ERROR` / `UNKNOWN_ERROR` | 未分类的 SDK 或内嵌页错误。查看 `message` 和可选的 `details`。 |
