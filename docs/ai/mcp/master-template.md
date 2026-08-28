---
title: 在 MCP 中使用母版
description: 通过 MCP 将母版应用到指定画板、全部画板或后续新建画板
---

# 在 MCP 中使用母版

母版用于统一项目的视觉风格，包括画板背景、网格、坐标轴，以及点、线、圆、文本等对象的默认样式。通过 MCP，你可以让 AI 加载母版后再作图，也可以把母版应用到已有画板。

::: tip 名称说明
有些场景也会把母版称为“模板”或“风格模板”。本文统一使用“母版”。
:::

## 使用前准备

1. 按照 [MCP 接入](./)完成服务连接。
2. 在[大角几何母版](https://dajiaoai.com/master-templates)页面选择并下载母版 JSON。

## 快速开始

准备好母版后，只需告诉 AI **母版来源**和**应用范围**。AI 通常会自动调用 `load_template`，无需手动填写工具参数。

### 方式一：上传本地母版

先把下载好的母版 JSON 上传到对话，然后发送：

```text
读取我上传的母版文件，应用到全部现有画板，并设为后续新建画板的默认母版。
然后画一个边长为 4 的正三角形。
```

### 方式二：提供母版地址

如果母版 JSON 可以通过公开的 HTTPS 地址直接访问，发送：

```text
加载 https://example.com/template.json 的母版，应用到第 1、3 个画板，
并设为后续新建画板的默认母版。
```

## `load_template` 工具

`load_template` 负责把母版加载到当前 MCP 会话。调用时需要选择一个母版来源，并指定至少一种应用方式。

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `template_content` | object | 与 `template_url` 二选一 | 内联母版 JSON。适合客户端已经读取了本地母版文件的场景。 |
| `template_url` | string | 与 `template_content` 二选一 | 公开母版 JSON 的 HTTPS 地址。 |
| `applyToSlideIndexes` | number[] | 应用方式至少选一 | 立即应用母版的画板序号，从 `1` 开始，数组不能为空。 |
| `applyToAllSlides` | boolean | 应用方式至少选一 | 设为 `true` 时立即应用到全部现有画板，并优先于 `applyToSlideIndexes`。 |
| `setAsGlobal` | boolean | 应用方式至少选一 | 设为 `true` 时，将母版设为当前会话中后续新建画板的默认母版。可与另外两种应用方式组合。 |

一次调用必须满足以下规则：

- `template_content` 和 `template_url` 必须且只能提供一个。
- `applyToSlideIndexes`、`applyToAllSlides: true`、`setAsGlobal: true` 至少提供一种。
- 画板序号从 `1` 开始，不能超过当前项目的画板数量。

### 如何选择

| 需求 | 参数选择 |
| --- | --- |
| 使用已上传或客户端已读取的母版文件 | `template_content` |
| 使用公开的远程母版 | `template_url` |
| 只应用到部分已有画板 | `applyToSlideIndexes` |
| 应用到全部已有画板 | `applyToAllSlides: true` |
| 只让后续新建画板使用母版 | `setAsGlobal: true` |
| 已有画板和后续新建画板都使用母版 | 同时设置 `applyToAllSlides: true` 和 `setAsGlobal: true` |

::: info
如果同时提供 `applyToSlideIndexes` 和 `applyToAllSlides: true`，将以 `applyToAllSlides` 为准。
:::

## 常见问题

### 母版已加载，为什么已有画板没有变化？

如果只设置了 `setAsGlobal: true`，母版只会用于当前会话后续新建的画板。还需要设置 `applyToAllSlides: true`，或通过 `applyToSlideIndexes` 指定已有画板。

### 为什么某个对象没有完全采用母版样式？

母版设置的是类型默认样式。已有对象如果保存了按对象 ID 设置的独立样式，该独立样式仍会保留。可以让 AI 清除或调整该对象的单独样式后再检查。

### 使用母版如何计费？

成功调用一次 `load_template` 属于基础工具调用。详情见 [MCP 计费说明](./billing)。
