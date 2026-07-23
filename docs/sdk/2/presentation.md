---
title: SDK 2.x 演示模式
description: 查询新版演示模式的初始化方式、核心方法与适用场景
---

# 演示模式 (Presentation Mode)

演示模式主要用于第三方系统中的内容分发与展示场景，如在线题库、课件系统等。

## 场景特点

- **轻量高效**：不加载编辑工具集，资源占用更小。
- **深度控制**：支持通过 API 精确干预画板状态。

## 实例创建

```typescript
import { createPresentation, EmbeddedPresentation } from '@dajiaoai/algeo-sdk';

/**
 * @param container 挂载的 DOM 节点
 * @param options 初始化选项
 */
const presentation: EmbeddedPresentation = await createPresentation(container, {
  auth: { appId: 'YTVJDQZR' },
  shareId: '可选初始 ID',
});
```

`appId` 获取方式详见[快速开始：获取 appId](./getting-started.html#_4-获取-appid)。

### UI 配置

```typescript
const presentation: EmbeddedPresentation = await createPresentation(container, {
  auth: { appId: 'YTVJDQZR' },
  ui: {
    logo: true,
  },
});
```

| 属性      | 类型      | 默认值 | 说明                                    |
| --------- | --------- | ------ | --------------------------------------- |
| `ui.logo` | `boolean` | `true` | 是否显示 logo 水印。从 `2.7.0` 起支持。 |

## API 参考

### `loadShareById(id: string): Promise<{ success: true }>`

根据大角几何分享 ID 加载内容。

- **参数**: `id`: string (如 '33TA3484')
- **返回**: `{ success: true }`

### `loadFile(content: FileContentLatest): Promise<{ success: true }>`

加载符合 FileContentLatest 协议的结构化 JSON 数据。

- **参数**: `content`: [DSL 协议详情](./protocol)

### `switchSlide(index: number): Promise<{ success: true }>`

跳转到指定序号的画板（从 0 开始计数）。

- **参数**: `index`: number

### `getSlideCount(): Promise<{ count: number }>`

获取当前文档的总画板数量。

### `repl(command: string): Promise<{ output: string }>`

核心 API：向画板发送 REPL 执行序列。可用于自动化绘图、设置参数等。

- **示例**: `presentation.repl('P1(2,3); P2(-1,0); SEG(P1, P2);')`
- **详细指令**: [查看 REPL 完整手册](/sdk/repl)

### `mode`

- `getUiConfig()`：获取当前 UI 配置。
- `setUiConfig(config)`：更新 UI 配置。
- `setMasterTemplate(template)`：设置母版风格。

#### `mode.setMasterTemplate(template: string)`

从 `2.9.0` 起，演示模式支持通过 `mode.setMasterTemplate` 设置母版风格，用于统一画板背景、网格、默认图形样式等母版配置。

```typescript
await presentation.mode.setMasterTemplate(masterTemplateContent);
```

您可以在[大角母版页](https://dajiaoai.com/master-templates)下载可直接传入 `setMasterTemplate` 的母版数据。

### `resize(): void`

自 `2.10.0` 起支持。

通知内嵌页重新测量容器并重绘画布。SDK 会在容器尺寸变化时自动调用；
布局切换或面板展开后也可手动调用 `presentation.resize()`。

### `destroy(): Promise<void>`

销毁当前实例，移除 iframe 和通信监听，并拒绝所有尚未完成的请求。

## 事件订阅

`on(event, listener)` 返回一个取消订阅函数，应在组件卸载或实例销毁前调用以避免内存泄漏。

```typescript
// 订阅 ready 事件，画板就绪后再执行后续操作
const unsubscribe = presentation.on('ready', (event) => {
  console.log('画板就绪，iframe 版本：', event.version);
  console.log('当前模式：', event.mode);
});

// 不再需要时取消订阅
unsubscribe();
```

| 事件名  | 触发时机                          | 回调参数类型                                               |
| ------- | --------------------------------- | ---------------------------------------------------------- |
| `ready` | iframe 完成初始化，可开始调用方法 | `{ type: 'ready', mode: string, version: string \| null }` |
