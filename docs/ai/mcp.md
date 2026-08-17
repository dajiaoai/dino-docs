---
title: MCP 接入
description: 通过 Bearer Token 将大角几何 MCP 服务接入 VS Code、Cursor 与 Claude Code
---

# MCP 接入

MCP（Model Context Protocol）让支持该协议的 AI 客户端直接调用大角几何开放能力，在对话中完成作图、导出与项目读写等操作。

如果你的产品已经有 AI 助手、Agent 工作流或编程式工具调用需求，MCP 是当前接入 AI Agent 几何交互能力的标准方式。

::: info 尺寸单位
MCP 绘图中的字号、线宽等尺寸参数使用 px。如果目标是排版印刷，请先按[尺寸单位与换算](/reference/units)转换为 px。
:::

## 服务信息

- **MCP 服务地址**：`https://api.dajiaoai.com/mcp`
- **认证方式**：Bearer Token
- **请求头**：`Authorization: Bearer YOUR_TOKEN_HERE`
- **计费说明**：[查看 MCP 计费说明](./mcp-billing)

## MCP 认证

接入 MCP 前，需要先在控制台获取可用的 Bearer Token。

获取流程如下：

1. 进入<a href="https://open.dajiaoai.com/console/dashboard" target="_blank" rel="noreferrer">大角几何开放平台控制台</a>。
2. 注册应用。
3. 在应用中添加 API Key。
4. 将生成的 API Key 作为 Bearer Token 使用，写入请求头：`Authorization: Bearer YOUR_TOKEN_HERE`

![控制台中获取 Bearer Token 的位置示意](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/c04be56c-screenshot-20260525-172351.png)

## 连接前准备

在开始之前，请确认以下信息已经准备好：

- 你的 AI 客户端支持远程 MCP 服务
- 你已经获得可用的 Bearer Token
- 你的运行环境可以访问 `https://api.dajiaoai.com/mcp`

## MCP 能力

当前开放的核心能力包括：

| 工具名           | 作用                                                                   |
| :--------------- | :--------------------------------------------------------------------- |
| `algeo_repl`     | 在当前画板上执行交互式几何命令，创建、修改或查询对象                   |
| `load_template`  | 加载母版，应用到指定或全部现有画板，也可设为后续新建画板的默认母版     |
| `export_image`   | 将当前项目导出为 PNG 图片，并返回可访问的链接地址，链接有效期为 1 年   |
| `export_project` | 将当前项目导出为结构化 JSON，并返回可访问的链接地址，链接有效期为 1 天 |
| `import_project` | 将结构化 JSON 项目内容导入到当前 MCP 会话对应的项目中                  |

通常你不需要手动记住这些工具名。只要客户端支持工具调用，模型会根据你的自然语言请求选择合适的工具。

如需统一背景、网格、坐标轴和对象默认样式，请参阅[在 MCP 中使用母版](./master-template)。

## 可用工具

### Codex

在 Codex 中添加 MCP 服务时，选择 `Streamable HTTP`，并填写以下信息：

- 服务器地址：`https://api.dajiaoai.com/mcp`
- 请求头：`Authorization: Bearer YOUR_TOKEN_HERE`

如果你使用的是支持命令行配置的 Codex 环境，也可以通过对应的 MCP 添加命令补充同样的 Bearer 请求头。

### Claude Code

在终端运行：

```bash
claude mcp add --transport http dino-gsp https://api.dajiaoai.com/mcp --header "Authorization: Bearer YOUR_TOKEN_HERE"
```

添加成功后，可在 Claude Code 会话中使用 `/mcp` 查看服务状态。

### Cursor

编辑 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "dino-gsp": {
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

保存后回到 Cursor 的 `Tools & MCP` 页面，确认服务已成功加载。

### VS Code

在工作区创建或编辑 `.vscode/mcp.json`：

```json
{
  "servers": {
    "dino-gsp": {
      "type": "http",
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

也可以通过命令面板添加 MCP Server，类型选择 `HTTP (HTTP or Server-Sent Events)`，然后补充同样的 Bearer 头。

### WorkBuddy

在 WorkBuddy 中进入 MCP 配置页面，添加如下内容：

```json
{
  "mcpServers": {
    "dino-gsp": {
      "type": "http",
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      },
      "disabled": false
    }
  }
}
```

保存后返回 MCP 列表，确认服务已成功加载。

## 使用示例

![MCP Agent 对话示例](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/98536196-screenshot-20260525-171357.png)

## 常见问题

### 1. 返回 401 或无法列出工具怎么办？

优先检查以下几项：

- `Authorization` 请求头是否存在
- 是否使用了准确的 `Bearer ` 前缀
- 服务地址是否填写为 `https://api.dajiaoai.com/mcp`
