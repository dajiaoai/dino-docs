---
title: 快速开始
description: SDK 安装、基础用法、配置与错误处理 - 大角几何开放平台
---

# 快速开始

本文档介绍如何通过 SDK 在您的 Web 应用中嵌入大角几何画板。适用于教学系统、在线题库、教辅 App 等需要几何交互能力的场景。

<iframe
  src="https://dajiaoai.com/e/33TA3484"
  style="width: 100%; height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  allow="fullscreen"
  title="Algeo SDK 嵌入示例"
></iframe>

## 安装

### npm

```bash
npm install @dajiaoai/algeo-sdk
```

## 基础用法

### 方式一：SDK

```javascript
import { AlgeoSdk } from '@dajiaoai/algeo-sdk';

const container = document.getElementById('algeo-container');
const sdk = await AlgeoSdk.create(container, {
  initialId: '33TA3484', // 可选，初始加载的分享 ID
});

// 调用方法
sdk.loadShareById('33TA3484').then(() => console.log('加载成功'));
sdk.getSlideCount().then(({ count }) => console.log('画板数量:', count));
sdk.switchSlide(2).then(() => console.log('切换画板'));

// 销毁
// sdk.destroy();
```

### 方式二：直接 iframe

无需引入 SDK，直接在 iframe 的 `src` 中指定分享 ID：

```html
<iframe
  id="algeo-embed"
  src="https://dajiaoai.com/e/33TA3484"
  allow="fullscreen"
></iframe>
```

如需动态加载、切换画板等能力，请使用方式一（SDK）。

## 配置选项

| 属性        | 类型     | 默认值 | 说明                                  |
| ----------- | -------- | ------ | ------------------------------------- |
| `initialId` | `string` | `''`   | 初始加载的分享 ID，为空则加载空白画板 |

## 错误处理

所有异步方法在失败时会 reject `AlgeoSdkError`：

```javascript
try {
  await sdk.loadShareById('invalid');
} catch (e) {
  if (e.name === 'AlgeoSdkError') {
    console.error(e.code, e.message, e.details);
  }
}
```

常见错误码：`IFRAME_NOT_READY`、`TIMEOUT`、`DESTROYED`、`BAD_REQUEST`。完整错误码见 [协议说明](../api/protocol#错误码)。

## 更多示例

[嵌入示例](https://dajiaoai.github.io/algeo-sdk/examples/)：在线查看基础嵌入、SDK 方式、切换画板、loadFile、REPL 等案例。

SDK 包内提供 `examples` 目录，包含上述示例源码。在 `packages/algeo-sdk` 目录下执行 `npx serve .` 可本地运行。
