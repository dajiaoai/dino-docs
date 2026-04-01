---
title: 大角几何开放平台
description: 几何能力基础设施：SDK 接入嵌入式几何画板，规划中接口服务、AI 几何能力等
---

# 大角几何开放平台

大角几何致力于成为**几何能力基础设施**，通过组件化、API 化、Agent 化的方式，让几何绘图与理解能力嵌入更多产品与系统。数学几何相关能力，找大角几何。

## 已开放能力

### SDK 接入：嵌入式几何画板

通过 `@dajiaoai/algeo-sdk`，您可以在任意 Web 容器中嵌入几何画板，实现丰富的交互行为：

- **低接入成本**：绑定 DOM 容器即可创建内嵌画板，接入成本 < 1 天
- **完整交互**：支持加载文件、切换画板、REPL 指令等

**快速开始：**

```bash
npm install @dajiaoai/algeo-sdk
```

```javascript
import { AlgeoSdk } from '@dajiaoai/algeo-sdk';

const sdk = await AlgeoSdk.create(document.getElementById('container'));
sdk.loadShareById('33TA3484');
```

**嵌入示例展示：**

- [在线查看嵌入示例](https://dajiaoai.github.io/algeo-sdk/examples/)
- 可快速了解基础嵌入、SDK 初始化、加载内容、切换画板、REPL 交互等能力

详见 [快速开始](./guide/getting-started) 与 [SDK API 参考](./api/sdk)。

## 规划中能力（敬请期待）

以下能力正在规划与建设中，欢迎持续关注：

| 能力             | 定位                        | 典型场景                                                                  |
| ---------------- | --------------------------- | ------------------------------------------------------------------------- |
| **接口服务**     | 几何内容生产的上游能力      | 云端渲染（DSL → PNG/SVG/TikZ）、AI 生图、批量生成与离线渲染               |
| **AI 几何能力**  | AI 系统中的「几何能力专家」 | AI 解题、智能讲解、多步推理中的几何操作，可被 LLM/Agent 调用的 MCP Server |
| **几何渲染 API** | 推动 DSL 成为事实内容标准   | 文本/结构化输入 → 几何图形，锁定题库、教材、内容生产链路                  |

我们将通过开放平台能力与多方合作，将大角几何嵌入更多教学系统、在线题库、AI 产品，提升几何能力的触达。

## 文档导航

| 文档                                 | 说明                                                      |
| ------------------------------------ | --------------------------------------------------------- |
| [快速开始](./guide/getting-started)  | SDK 安装、基础用法、配置与错误处理                        |
| [SDK API](./api/sdk)                 | loadShareById、loadFile、switchSlide、getSlideCount、repl |
| [REPL 能力](./guide/repl)            | REPL 命令分类、几何类型、输出格式、语法约束               |
| [协议说明](./api/protocol)           | FileContentV10 结构、错误码                               |
| [商业许可说明](./COMMERCIAL_LICENSE) | iframe 免费传播范围、商业许可触发条件与合作边界           |
