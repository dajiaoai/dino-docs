---
title: SDK 2.x 快速开始
description: 使用新版 SDK 入口快速创建演示模式或编辑模式实例
---

# SDK 2.x 快速开始

本指南旨在帮助您快速掌握如何在大角几何开放平台中集成内嵌式几何画板。

<iframe
  src="https://dajiaoai.com/embed/edit/YTVJDQZR/33TA3484"
  style="width: 100%; height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  allow="fullscreen"
  title="Algeo SDK 嵌入示例"
></iframe>

## 1. 安装与配置

### npm 方式

```bash
npm install @dajiaoai/algeo-sdk@2
```

## 2. 核心概念

在使用 SDK 之前，您需要了解两种主要的运行模式：

- **演示模式 (Presentation Mode)**：专注于内容的“交互式展示”。支持加载分享 ID 或结构化文件、切换画板、执行 REPL 指令。
- **编辑模式 (Editor Mode)**：提供“几何内容创作”环境。支持增删画板、UI 定制、撤销重做以及与宿主间的保存交互。

## 3. 快速接入

### 接入演示模式

如果您只需要在网页中展示一个几何图形：

```javascript
import { createPresentation } from '@dajiaoai/algeo-sdk';

// 1. 获取挂载容器
const container = document.getElementById('algeo-viewer');

// 2. 创建并初始化实例
const presentation = await createPresentation(container, {
  auth: { appId: 'YTVJDQZR' },
  shareId: '33TA3484', // 可选，初始化后自动加载的内容 ID
});

// 3. 后续操作 (例如 3 秒后切换到第 2 页)
setTimeout(() => {
  presentation.switchSlide(1);
}, 3000);
```

### 接入编辑模式

如果您需要集成一个可编辑的绘图工具：

```javascript
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(document.getElementById('algeo-editor'), {
  auth: { appId: 'YTVJDQZR' },
  ui: {
    navbar: true, // 顶部导航开关
    slidePanel: true, // 侧边栏缩略图开关
    toolboxPanel: true, // 工具栏开关
  },
});

// 监听保存事件
editor.on('save', (event) => {
  console.log('保存内容:', event.content);
});
```

## 4. 获取 appId

SDK 创建演示模式或编辑模式实例时，都需要通过 `auth.appId` 进行身份验证。您可以通过以下步骤获取：

1. **访问开发者控制台**：前往 [大角几何开放平台控制台](https://open.dajiaoai.com/console/dashboard)
2. **注册应用**：在[控制台](https://open.dajiaoai.com/console)中创建新应用并填写应用信息
3. **获取凭证**：系统会生成您的 `appId`，复制该 ID 并配置到 `auth: { appId: '您的 appId' }`

如需协助，请 [联系我们](../../CONTACT)。

## 5. 常见问题

- **为什么 SDK 2.x 需要 appId？** 这是为了确保应用的合法性和安全性，演示模式和编辑模式都应在初始化时传入。
- **appId 有过期时间吗？** 您的 appId 长期有效，但可在[控制台](https://open.dajiaoai.com/console)中管理。

## 6. 下一步建议

- 如果您需要精细控制画板内元素，请阅读 [演示模式参考](./presentation)。
- 如果您需要实现复杂的编辑器功能，请阅读 [编辑模式参考](./editor)。
