---
title: SDK 2.4.2-beta 演示模式
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
  shareId: '可选初始 ID',
});
```

## API 参考

### `loadShareById(id: string): Promise<Result>`

根据大角几何分享 ID 加载内容。

- **参数**: `id`: string (如 '33TA3484')
- **返回**: 加载成功或失败的元数据。

### `loadFile(content: FileContentV10): Promise<Result>`

加载符合 FileContentV10 协议的结构化 JSON 数据。

- **参数**: `content`: [DSL 协议详情](./protocol)

### `switchSlide(index: number): Promise<Result>`

跳转到指定序号的画板（从 0 开始计数）。

- **参数**: `index`: number

### `getSlideCount(): Promise<{ count: number }>`

获取当前文档的总画板数量。

### `repl(command: string): Promise<Result>`

核心 API：向画板发送 REPL 执行序列。可用于自动化绘图、设置参数等。

- **示例**: `presentation.repl('P1(2,3); P2(-1,0); SEG(P1, P2);')`
- **详细指令**: [查看 REPL 完整手册](../../guide/repl)

### `destroy(): void`

销毁当前实例，移除 DOM 内容并释放通信监听。

## 事件监听

```typescript
presentation.on('loaded', (data) => {
  console.log('内容加载完成', data);
});
```
