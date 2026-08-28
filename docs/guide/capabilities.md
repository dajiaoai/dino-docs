---
title: 能力总览
description: 按对外易理解的能力单元，查看大角几何开放平台能提供什么、适合哪些场景、如何接入
---

# 能力总览

如果你已经明确要解决什么业务问题，请先看 <a href="./scenarios.html#scenario-mapping" target="_blank" rel="noreferrer">适用场景</a>。如果你更关心我们到底开放了哪些能力、每种能力能做到什么，这一页可以帮助你快速建立整体认知。

## 如何阅读这一页

- 想快速判断能不能接入：先看下方的“能力单元速览”。
- 想知道某种能力适合哪里：看每个能力单元中的“适用场景”和“典型例子”。
- 想从业务需求反推能力组合：再跳转到 <a href="./scenarios.html#scenario-mapping" target="_blank" rel="noreferrer">适用场景</a> 查看场景页中的推荐组合。

## 先选接入方式

如果你已经准备开始开发，不必逐个阅读全部能力单元。先根据“能力由谁调用”选择一条主路径：

| 接入方式 | 最适合的目标 | 能力边界 | 费用口径 | 从这里开始 |
| :--- | :--- | :--- | :--- | :--- |
| **内嵌画板（SDK）** | 在自己的网页或系统中展示、编辑几何内容 | 有可见画板；可加载内容、监听事件、保存、导出，并与前端业务联动 | 通常需要付费授权；免费产品可申请非商用许可 | [SDK 2.x 快速开始](../sdk/2/getting-started) |
| **MCP** | 让已有 AI 助手或 Agent 在对话和推理中实时作图 | AI 可创建、修改、查询图形，并导入/导出项目；不负责提供你产品中的前端画板 UI | 按调用量计费 | [MCP 接入](../ai/mcp/) |
| **HTTP API** | 在服务端批量生图、渲染或接入自动化内容流水线 | 无需打开画板；支持文字/图片生成 `.algeo`，以及 PNG、SVG、TikZ 渲染；不是实时画板交互接口 | 按调用量计费 | [API 接入](../api/) |

### 一句话判断

- **用户要在页面里看图、拖图或编辑**：选内嵌画板。
- **AI 要在一次对话里边推理边作图**：选 MCP。
- **程序化批量生成，人工继续调整编辑**：先用 API 生成 `.algeo`，再用内嵌画板加载。

<a id="capability-summary"></a>

## 能力单元速览

| 能力单元            | 解决什么问题                                          | 适合谁                              | 接入文档 | 关联场景                                                                                                                                                                                                                                                                                                                                                |
| :------------------ | :---------------------------------------------------- | :---------------------------------- | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 嵌入式演示画板      | 把动态几何图直接展示到你的页面里                      | 题库、课堂、课件平台                | [快速开始](../sdk/2/getting-started#接入演示模式) | <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">在线教育与智慧课堂</a>、<a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>                                                                                                                                |
| 嵌入式编辑画板      | 把可编辑的专业几何画板嵌入到你的业务系统中            | 教研平台、备课工具、内容生产后台    | [快速开始](../sdk/2/getting-started#接入编辑模式) | <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">在线教育与智慧课堂</a>、<a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>                                                                                                                                |
| 几何协议与 JS SDK   | 用代码加载、控制、保存和导出画板状态                  | 有研发能力、需要深度集成的团队      | [SDK 文档](../sdk/) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>、<a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">独立开发者与数学创新工具</a>                                                                                                                    |
| AI Agent 几何交互   | 让 AI 或 Agent 在推理过程中实时作图、读状态、改图形   | AI Tutor、智能讲解、自动化解题产品  | [MCP 接入](../ai/mcp/) | <a href="./scenarios.html#scenario-ai-tutoring" target="_blank" rel="noreferrer">AI 智能辅导</a>                                                                                                                                                                                                                                                        |
| 图片与结构化导出    | 把几何内容输出为图片、协议数据或后续可处理结果        | 内容生产、题库加工、结果落地链路    | [SDK 文档](../sdk/) · [渲染 API](../api/render) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>、<a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>                                                                                                                                 |
| HTTP API 服务端接入 | 后端直接调用 AI 生图与渲染能力，实现端到端智能生成几何动图          | 后端团队、自动化内容流水线、AI 应用 | [API 接入](../api/) | <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>、<a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>、<a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">独立开发者与数学创新工具</a> |

<a id="capability-embedded-presentation"></a>

## 1. 嵌入式演示画板

这是最容易理解、也是最容易落地的能力单元。你可以把一个可拖动、可播放、可交互的几何画板直接嵌入网页，用动态内容替代静态图。

**你会得到什么**

- 在课程页、解析页、讲解页中展示动态几何图形。
- 支持拖拽、参数联动、动画播放等基础交互。
- 支持 PC 和移动端展示。

**适用场景**

- <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">在线教育与智慧课堂</a>
- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>

**典型例子**

- 在几何题解析页中嵌入一个可拖动的辅助线演示图。
- 在课堂课件中插入一个可以播放图形变换过程的动态组件。

**什么时候优先选它**

- 你当前最关心的是“展示效果”和快速落地。
- 你希望先把静态题图升级为动态内容，再逐步增加更深的接入能力。

<a id="capability-embedded-editor"></a>

## 2. 嵌入式编辑画板

这个能力单元面向内容生产。它是把专业的几何编辑器嵌入到你的系统里，让老师、教研或运营人员直接在业务后台里画图、改图、导出结果。

**你会得到什么**

- 完整的几何绘图与编辑工具箱。
- 可配置的工具栏和交互权限。
- 保存、导出、回调等适合集成到业务流程的能力。

**适用场景**

- <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">在线教育与智慧课堂</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>
- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>

**典型例子**

- 在题库后台提供“直接画题图”的编辑器入口。
- 在教案系统中嵌入画板，让教师边写讲义边生成几何图。

**什么时候优先选它**

- 你的业务里有人要持续生产几何内容。
- 你需要的是“嵌入一个编辑器”，直接承接内容生产流程。

<a id="capability-sdk-protocol"></a>

## 3. 几何协议与 JS SDK

这个能力单元面向需要代码级控制的团队。你可以通过 SDK 和结构化协议，把几何画板纳入自己的前端和业务逻辑中，形成完整的集成链路。

**你会得到什么**

- 用代码初始化画板、切换模式、加载内容。
- 监听用户操作、读取当前状态、触发保存或导出。
- 用结构化协议在你的系统和大角几何之间传递几何内容。

**适用场景**

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">独立开发者与数学创新工具</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>

**典型例子**

- 题库系统根据题目 ID 拉取协议数据，再自动渲染对应几何图。
- 数学工具根据自己的参数面板，实时驱动画板更新图形状态。

**什么时候优先选它**

- 你需要把画板接入既有业务流程、权限体系和数据链路。
- 你需要“控制、监听、保存、导出”等完整能力。

<a id="capability-ai-agent"></a>

## 4. AI Agent 几何交互

这个能力单元面向 AI 原生产品。核心是让模型、Agent 或自动化流程可以在推理过程中直接调用几何能力。当前通过 <a href="../ai/mcp/" target="_blank" rel="noreferrer">MCP 协议</a>接入，支持主流 AI 客户端（Claude Code、Cursor、VS Code、Codex 等）。

**你会得到什么**

- 让 AI 通过指令创建、修改、查询几何对象。
- 把当前画板状态作为模型上下文的一部分。
- 支持把”讲题过程”转化为”边推理边作图”的交互链路。
- 支持在对话中导出图片或项目文件，嵌入结果到下游流程。

**适用场景**

- <a href="./scenarios.html#scenario-ai-tutoring" target="_blank" rel="noreferrer">AI 智能辅导</a>
- <a href="./scenarios.html#scenario-online-education" target="_blank" rel="noreferrer">在线教育与智慧课堂</a>

**典型例子**

- AI Tutor 在讲解”作辅助线”时，自动在画板中补出对应构造。
- 智能代理根据当前图形状态判断下一步该验证哪条关系。
- Agent 工作流在推理结束后自动导出图片，附在回复结果中。

**什么时候优先选它**

- 你的产品里已经有 LLM、Agent 或自动化推理链路。
- 你希望 AI 的几何讲解是伴随实时图形演示的。
- 你的场景是”AI 驱动的交互式画板”，而不是”批量离线生产内容”（后者见 HTTP API 服务端接入）。

<a id="capability-export"></a>

## 5. 图片与结构化导出

很多业务最终需要的是“可以落地的结果”，例如图片、结构化协议数据或其他后续可处理内容。这个能力单元负责把几何内容从画板状态转成可保存、可流转、可分发的输出。

**你会得到什么**

- 导出图片，用于题库列表、讲义、PPT 或结果页展示。
- 导出结构化协议数据，方便后续再编辑、再渲染、再加工。
- 为批量内容生产和内容流转提供结果承接层。

**适用场景**

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">独立开发者与数学创新工具</a>

**典型例子**

- 题库批量生成缩略图，用于列表页和预览页。
- 教师将编辑好的几何图导出为图片，放入 PPT 或讲义。

**什么时候优先选它**

- 你的业务要把几何内容写入自己的存储、工作流或内容系统。
- 你需要兼顾“在线交互内容”和“离线可落地结果”。

<a id="capability-api"></a>

## 6. HTTP API 服务端接入

这个能力单元面向后端与自动化场景。核心是通过标准 HTTP 接口，在不启动前端画板的情况下直接调用 AI 生图与渲染能力。与 SDK 和嵌入式组件不同，这里的调用方是你的服务端代码，而不是用户的浏览器。

**你会得到什么**

- **智能生图**：调用 Agent API，输入文字描述或参考图片，异步返回可交互的几何项目文件（`.algeo`）。支持文字单独输入，也支持文字 + 图片组合输入（如手绘草图识别）。
- **渲染导出**：调用 Render API，将已有几何项目内容渲染为 PNG、SVG 或 TikZ 格式，同步返回文件 URL。
- 两类接口均通过 Bearer API Key 鉴权，可独立使用，也可串联使用（先生图，再渲染）。

**适用场景**

- <a href="./scenarios.html#scenario-question-bank" target="_blank" rel="noreferrer">数字化题库与内容平台</a>
- <a href="./scenarios.html#scenario-authoring-tools" target="_blank" rel="noreferrer">教案与课件生产工具</a>
- <a href="./scenarios.html#scenario-independent-developers" target="_blank" rel="noreferrer">独立开发者与数学创新工具</a>

**典型例子**

- 题库后台导入新题目时，自动调用智能生图接口根据题干生成几何图，再用渲染接口输出缩略图。
- 内容平台批量处理已有几何项目，通过渲染接口统一导出 PNG 用于 PDF 报告或题目列表页。
- 开发者将参考图（手绘草图或截图）上传给智能生图接口，AI 识别结构后返回可编辑的几何项目。

## 常见组合方式

### 只做展示型接入

- 推荐组合：嵌入式演示画板
- 常见于：课堂讲解页、题目解析页、内容展示页

### 既要展示，也要深度控制

- 推荐组合：嵌入式演示画板 + 几何协议与 JS SDK
- 常见于：题库平台、交互习题、带业务逻辑联动的教学系统

### 需要内容生产后台

- 推荐组合：嵌入式编辑画板 + 图片与结构化导出
- 常见于：教案平台、课件工具、题库运营后台

### 需要 AI 原生几何能力（交互式）

- 推荐组合：AI Agent 几何交互（MCP）+ 几何协议与 JS SDK
- 常见于：AI Tutor、智能讲解、自动化作图与解题产品

### 需要后端批量生产或自动化处理几何内容

- 推荐组合：HTTP API 服务端接入（智能生图 + 渲染导出）+ SDK 编辑模式
- 常见于：内容平台批量建图、题库自动化加工，以及批量生成后由人工继续修正、优化几何图形的内容生产流程
