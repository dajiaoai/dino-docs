---
title: 安装大角几何 Skill
description: 通过 SkillHub 安装大角几何 Skill，让 Agent 更准确地调用大角几何 MCP
---

# 安装大角几何 Skill

大角几何 Skill 为 Agent 提供 MCP 工具说明、作图规则和常用操作流程，帮助模型更准确地创建、编辑和导出几何图形。

Skill 是 MCP 的操作知识层，不能替代 MCP 连接。安装前请先完成 [MCP 接入](./mcp)，并确认客户端能够调用大角几何 MCP 工具。

## 适用条件

开始前，请确认：

- 你的 AI 客户端支持 Agent Skills，并能连接远程 MCP 服务
- 你已在大角几何开放平台创建应用并获取 API Key
- 大角几何 MCP 已连接成功，且客户端能够列出其工具

不同客户端安装和加载 Skill 的方式可能不同，请以对应客户端的说明为准。

## 通过 SkillHub 安装

<a href="https://skillhub.cn/" target="_blank" rel="noreferrer">SkillHub</a> 是专为中国用户优化的第三方 AI Skills 社区。大角几何 Skill 页面提供最新版本、内容说明、版本记录和下载入口：

<a href="https://skillhub.cn/skills/user_839cf8f8/dino-algeo" target="_blank" rel="noreferrer">在 SkillHub 查看大角几何 Skill</a>

推荐将下面的提示词发送给你的 AI，让它按照 SkillHub 安装说明完成安装：

```text
请根据 https://skillhub.cn/install/skillhub.md，安装 @user_839cf8f8/dino-algeo。
```

如果客户端无法通过提示词安装，可在 SkillHub 页面下载 ZIP 包，再按照客户端的本地 Skill 安装方式导入。

::: warning API Key 安全
安装 Skill 不需要提供 API Key。API Key 只应填写在客户端的 MCP 配置中，不要将其粘贴到对话、Skill 内容或提交到代码仓库。
:::

## 验证安装

安装并重新加载 Skill 后，可以向 Agent 发送以下请求：

```text
使用大角几何画一个等腰直角三角形，标注三个顶点，并导出图片。
```

成功时，Agent 应创建新的大角几何会话、完成作图，并返回导出的图片。如果工具调用返回 `401` 或客户端找不到相关工具，请先按照 [MCP 接入常见问题](./mcp#常见问题)检查服务地址、Bearer Token 和连接状态。

## 继续阅读

- 在 SkillHub 查看 Skill 的完整工具说明、操作规则和版本记录
- [在 MCP 中使用母版](./master-template)，统一 AI 绘图的背景、坐标轴和对象样式
- [MCP 计费说明](./mcp-billing)，了解工具调用成本
