---
title: SDK 1.2.1 示例参考
description: 基于 1.2.1 版本的场景化示例索引
---

# SDK 1.2.1 示例参考

1.2.1 版本提供了丰富的场景化示例，帮助您快速理解 SDK 各项功能的落地方式。

## 基础嵌入

- **[01-basic-iframe.html](https://dajiaoai.github.io/algeo-sdk/examples/01-basic-iframe.html)**: 纯 HTML `<iframe>` 方式接入。
- **[02-sdk-usage.html](https://dajiaoai.github.io/algeo-sdk/examples/02-sdk-usage.html)**: 使用 `AlgeoSdk.create` 初始化的标准流程。

## 常用操作

- **[03-switch-slide.html](https://dajiaoai.github.io/algeo-sdk/examples/03-switch-slide.html)**: 外部按钮控制画板翻页。
- **[04-load-file.html](https://dajiaoai.github.io/algeo-sdk/examples/04-load-file.html)**: 动态注入 JSON 文件内容。
- **[05-repl.html](https://dajiaoai.github.io/algeo-sdk/examples/05-repl.html)**: 通过命令行与几何引擎交互。

## 源码位置

SDK 安装包内包含完整的 `examples/` 目录。在项目中可以通过以下路径访问示例源码：

```text
node_modules/@dajiaoai/algeo-sdk/examples/
```

如果您已克隆仓库，在 `packages/algeo-sdk` 目录下运行：

```bash
npx serve .
```

即可在本地浏览器预览所有示例。
