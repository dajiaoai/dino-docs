---
title: SDK 1.2.1 API 参考
description: 基于 1.2.1 版本的类、方法与事件说明
---

# SDK 1.2.1 API 参考

本文档详述 `AlgeoSdk` 类在 1.2.1 版本中提供的公共接口。

## 实例创建

### `AlgeoSdk.create(container, options): Promise<AlgeoSdk>`

异步创建并初始化 SDK 实例。在 iframe 加载完成并收到 `ready` 消息后 resolve。

- **container**: `HTMLElement` - 挂载 iframe 的 DOM 容器。
- **options**: `AlgeoSdkOptions` - 创建配置。
  - `initialId`: `string` (可选) - 初始加载的分享 ID。

---

## 实例方法

所有实例方法均返回 `Promise`，并在 iframe 响应或超时后 resolve/reject。

### `loadShareById(id: string): Promise<void>`

加载指定分享 ID 的画板内容。

### `loadFile(content: FileContentLatest): Promise<void>`

直接注入符合规格的画板 JSON 内容。

### `switchSlide(index: number): Promise<void>`

切换至指定索引的画板（从 0 开始）。

### `getSlideCount(): Promise<{ count: number }>`

查询当前打开的文件包含的画板总数。

### `repl(command: string): Promise<{ output: string }>`

在当前画板上下文中执行 REPL 指令。

### `destroy(): void`

手动销毁 SDK 实例，移除 iframe 及其监听器。

