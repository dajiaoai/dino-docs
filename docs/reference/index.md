---
title: 通用规范
description: 大角几何 SDK、API 与 MCP 共同遵循的参数和数据规范
---

# 通用规范

本分组收录大角几何 SDK、API 与 MCP 共同遵循的规范。无论通过哪种方式接入，均应按这些规则解释和传递参数。

## 通用规范

- [大角工程文件（.algeo）数据协议](./algeo-file-protocol)：工程文件的版本、画板、AI 会话、母版和元数据结构。
- [尺寸单位与换算](./units)：字号、线宽等尺寸参数的 px 标准，以及 px 与 pt 的换算方法。
- [字体支持](./fonts)：公开支持的字体列表，以及 SDK、MCP 和 HTTP API 的自定义字体接入方式。

## 教程

- [多环节图片导出尺寸一致性](./consistent-image-export)：在 SDK、MCP 等导出链路中统一精确裁剪窗口，稳定控制构图和像素尺寸。
