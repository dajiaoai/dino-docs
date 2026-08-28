---
title: SDK 2.11.0 图片素材库、第三方图片与 REPL 能力更新
description: SDK 2.11.0 支持接入自有图片素材库，MCP 和 API 支持向画板插入第三方图片，REPL 协议新增 Image 图片定义能力。
---

# SDK 2.11.0 图片素材库、第三方图片与 REPL 能力更新

- 类型：能力上新
- 发布时间：2026-08-17
- 生效时间：2026-08-17
- 影响范围：使用 SDK 2.x 内嵌编辑模式、MCP、智能生图 API 或 REPL 的开发者
- 是否需要操作：现有接入无需修改；使用新能力时，请提供可从浏览器或服务端访问的完整 HTTP(S) 图片 URL

## 更新内容

本次更新打通了内嵌编辑器、MCP/API 与 REPL 的图片插入能力：

1. **SDK 编辑模式支持自有图片素材库**：创建编辑器时可传入 `resourceLibrary` Provider。宿主负责素材查询、分页、搜索与鉴权，内嵌编辑器负责展示素材并将用户选中的图片插入当前画板。
2. **MCP/API 支持画板插入第三方图片**：MCP 和智能生图 API 现可将完整的 HTTP(S) 图片 URL 作为画板图片素材。导出图片时，服务端会加载并渲染这些远程图片资源。
3. **REPL 协议新增图片定义能力**：可使用 `Image` 构造器将远程图片定义为画板对象，并继续通过 REPL 进行查询、样式设置与项目导出。

## SDK 自有图片素材库

SDK 接入方可在创建编辑器时注册素材查询 Provider：

```ts
const editor = await createEditor(container, {
  auth: { appId: 'YOUR_APP_ID' },
  resourceLibrary: {
    async query(params, { signal }) {
      const response = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal,
      });

      return response.json();
    },
  },
});
```

图片仍由接入方存储和鉴权。未配置 `resourceLibrary` 时，编辑器不会展示图片素材入口。

## MCP/API 插入第三方图片

在 MCP 或智能生图 API 的作图任务中，可要求 Agent 将指定的远程图片放入画板。第三方图片 URL 需要满足：

- 使用完整的 `http://` 或 `https://` URL。
- 可被大角几何 MCP/API 服务端直接访问。
- 不使用本地文件路径、`file://`、`blob:` 或 Base64 内容作为图片地址。

如果图片来自聊天附件、本地文件或剪贴板，需先上传到可公开访问或带有有效临时签名的 HTTP(S) 地址，再将该 URL 作为图片对象加入画板。

## REPL 图片定义

通过 REPL 插入第三方图片：

```text
def img := Image("https://example.com/image.png")
```

`Image` 的参数是图片资源标识。在 MCP/API 服务端场景中，该标识应为服务端可访问的完整 HTTP(S) 图片 URL。

可通过帮助命令查看当前环境支持的完整语法：

```text
help Image
```

## 相关链接

- [画板插入图片素材](/sdk/2/image-material-library)
- [编辑模式文档](/sdk/2/editor)
- [MCP 接入](/ai/mcp/)
- [智能生图 API](/api/agent)
- [REPL 能力](/sdk/repl)
