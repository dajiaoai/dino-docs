---
title: 适用场景
description: 从业务场景理解大角几何开放平台适合怎样的接入需求，以及每种场景推荐使用哪些能力单元
---

# 适用场景

如果你更习惯从“我在做什么产品”出发，这一页更适合你。每个场景都对应推荐的能力单元，并给出一个典型接入例子，帮助你快速判断是否匹配。

## 如何阅读这一页

- 想先判断产品是否适配：直接看你最接近的业务场景。
- 想知道该接哪些能力：看每个场景下的“推荐能力单元”。
- 想先理解能力边界：再回到 <a href="./capabilities.html#capability-summary" target="_blank" rel="noreferrer">能力总览</a> 查看每个能力单元的详细说明。

<a id="scenario-mapping"></a>

## 场景与能力的对应关系

| 场景                     | 核心诉求                                   | 推荐能力单元                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :----------------------- | :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 在线教育与智慧课堂       | 让抽象几何知识在教学页面中动态呈现         | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">嵌入式演示画板</a>、<a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">嵌入式编辑画板</a>、<a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>                                                                                                                                                       |
| 数字化题库与内容平台     | 降低题图生产成本，增强题目交互性           | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">嵌入式演示画板</a>、<a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>、<a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>、<a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>                                                 |
| AI 智能辅导              | 让模型边推理边作图，输出更生动的几何讲解   | <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>、<a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>、<a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>                                                                                                                                                                    |
| 企业级内容生产 AI Agent | 将教案、配图、课件与几何内容串联成自动化生产流程 | <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>、<a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>、<a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>、<a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a> |
| 教案与课件生产工具       | 让教研团队在自己的系统中生产几何内容       | <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">嵌入式编辑画板</a>、<a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>、<a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>                                                                                                                                                                       |
| 独立开发者与数学创新工具 | 直接复用成熟几何基础设施，聚焦自身创新逻辑 | <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>、<a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>、<a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>                                                                                                                                                                       |

<a id="scenario-online-education"></a>

## 1. 在线教育与智慧课堂

这是最典型的教学展示场景。核心目标是把动态几何能力无缝放进课堂和学习流程里。

**场景示意**

![在线教育与智慧课堂案例示意图](https://luhuidev.oss-cn-beijing.aliyuncs.com/md/234554d431aa0f7450892d89.jpg)

**你可能在做什么产品**

- 在线课堂
- 互动讲义
- 课件播放系统
- 学习平板或课堂大屏

**推荐能力单元**

- <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">嵌入式演示画板</a>
- <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">嵌入式编辑画板</a>
- <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>

**为什么适合**

- 可以把静态题图升级为可拖动、可演示、可播放的动态内容。
- 如果你的课堂系统带 AI 助教，还可以让 AI 在讲解时同步画图。

**典型例子**

- 教师在讲解全等三角形时，课堂页面内直接展示一个可拖动顶点的动态图。
- AI 助教在讲题时，一边输出文字解析，一边自动补出辅助线。

<a id="scenario-question-bank"></a>

## 2. 数字化题库与内容平台

这一类场景往往内容量大、更新频繁，人工为每道题做静态图成本很高。更合适的方式是把几何内容结构化，再按需渲染、交互和导出。

**场景示意**

![数字化题库与内容平台场景示意图](https://luhuidev.oss-cn-beijing.aliyuncs.com/md/6ff68f93eb3d6a3d0e16382d.png)

**你可能在做什么产品**

- 题库平台
- 搜题解析页
- 习题练习系统
- 教辅内容中台

**推荐能力单元**

- <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">嵌入式演示画板</a>
- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>
- <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>

**为什么适合**

- 既可以在前台展示动态题图，也可以在后台用代码批量处理几何内容。
- 适合把题目、图形、导出结果接入现有题库工作流。
- 对于大量存量题目，可以通过智能生图接口批量将文字描述或参考图自动转换为可交互的几何项目。

**典型例子**

- 题库详情页加载可交互图形，学生通过拖动验证结论是否成立。
- 运营后台根据结构化数据批量生成题图缩略图和展示图。
- 后台定时任务调用智能生图接口，将新录入题目的几何描述批量转换为图形，再通过渲染接口生成预览图。

<a id="scenario-ai-tutoring"></a>

## 3. AI 智能辅导

这个场景的关键是“让 AI 真正拥有几何操作能力”。如果模型只能输出文字，它在讲解几何题时的表现会很枯燥。

**场景示意**

![AI 智能辅导场景示意图](https://luhuidev.oss-cn-beijing.aliyuncs.com/md/f864a26517c1d3b1fcadca11.jpg)

**你可能在做什么产品**

- AI Tutor
- 智能答疑
- 自动解题与讲解产品
- Agent 驱动的数学学习助手

**推荐能力单元**

- <a href=”./capabilities.html#capability-ai-agent” target=”_blank” rel=”noreferrer”>AI Agent 几何交互</a>（交互式推理）
- <a href=”./capabilities.html#capability-sdk-protocol” target=”_blank” rel=”noreferrer”>几何协议与 JS SDK</a>
- <a href=”./capabilities.html#capability-api” target=”_blank” rel=”noreferrer”>HTTP API 服务端接入</a>（自动化生成）

**为什么适合**

- 模型可以把作图过程纳入推理链，让图形成为讲解上下文的一部分。
- 可以实时读取图形状态，支持更强的诊断、讲解和追问能力。
- 对于非实时场景（如预生成讲解图、批量制作题目配图），也可以通过智能生图接口在服务端直接从题目描述生成几何项目。

**典型例子**

- AI 在讲”证明圆周角相等”时，通过 MCP 自动构造圆、弦和对应角，并逐步展示证明辅助图。
- 智能答疑系统根据学生在画板上的拖动结果，判断其是否真正理解了几何关系。
- 内容平台在后台预生成大量讲解配图：调用智能生图接口将每道例题的解题步骤转换为几何项目，再渲染为图片附在解析中。

<a id="scenario-enterprise-ai-agent"></a>

## 4. 企业级内容生产 AI Agent

这个场景面向希望建设自有 AI 能力的企业。企业可以将大模型、内部知识库、审核规范与大角几何开放能力组合起来，实现从需求理解到内容交付的完整生产 Agent，而不必从零开发专业几何引擎。

**场景示意**

![企业级内容生产 AI Agent 场景示意图](/enterprise-content-agent.png)

**你可能在做什么产品**

- 企业内容生产 Agent
- 智能教研与备课平台
- 教育内容生产中台
- 教材、教辅和课件自动化生产系统

**Agent 可以完成什么**

- 根据课程标准、教学目标和企业知识库生成教案及教学活动设计。
- 为知识点、例题和教学环节生成所需图片与视觉素材。
- 自动规划课件结构，生成页面内容并组装成可交付课件。
- 识别内容中的几何绘图需求，调用大角几何生成可编辑、可交互的专业图形。

**推荐能力单元**

- <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>
- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>
- <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>

**为什么适合**

- 企业保留 Agent 编排、知识库、模型选择和业务规则的自主权，大角几何提供其中专业的几何内容能力。
- 教案、图片、课件和几何图不再是彼此割裂的生产环节，可以由 Agent 根据上下文统一规划和调用。
- 几何结果既能直接渲染为图片，也能保留结构化数据，方便人工复核、二次编辑和跨终端交付。
- 可在关键节点加入人工审核与企业规范校验，兼顾自动化效率和内容质量。

**典型工作流**

1. 教研人员输入年级、知识点、课时目标和内容要求。
2. 企业 Agent 检索内部知识库，生成教案框架、讲解文本和课件大纲。
3. Agent 分析各页面的素材需求，分别调用图片生成、课件制作和大角几何能力。
4. 大角几何根据自然语言或参考图生成结构化几何内容，并输出预览图或可交互项目。
5. Agent 汇总全部内容、执行企业规范检查，再交由教研人员审核和发布。

<a id="scenario-authoring-tools"></a>

## 5. 教案与课件生产工具

这个场景面向的是内容生产者。重点在于提升制作效率、减少重复劳动，并让内容在系统之间更容易流转。

**你可能在做什么产品**

- 教案编写平台
- 课件制作工具
- 教研协同系统
- 内容生产后台

**推荐能力单元**

- <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">嵌入式编辑画板</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>
- <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>

**为什么适合**

- 可以把专业几何编辑能力直接放进内容生产流程，不用跳出系统单独制图。
- 图形既能导出图片交付，也能保留结构化结果便于后续再编辑。
- 对于内容量大的团队，可以通过智能生图接口快速从文字描述生成初稿，再在嵌入式编辑画板中精修。

**典型例子**

- 教师在备课系统里直接插入并编辑几何图，完成后导出到课件页面。
- 教研团队在内容平台中沉淀可复用的结构化几何素材库。
- 内容编辑输入例题描述，后台调用智能生图接口生成几何初稿，编辑在前端画板中微调后发布。

<a id="scenario-independent-developers"></a>

## 6. 独立开发者与数学创新工具

如果你的产品创新点不在“重新造一个几何引擎”，而在新的交互方式、分析逻辑或学科应用，那么更适合直接复用现成能力单元。

**你可能在做什么产品**

- 函数图像工具
- 定理验证工具
- 数学实验应用
- 垂直学科创新产品

**推荐能力单元**

- <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>
- <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>
- <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>

**为什么适合**

- 你可以把精力放在自己的核心算法、交互或产品设计上，直接复用底层几何渲染和约束求解能力。
- 更适合快速验证新产品方向，再逐步加深接入深度。
- HTTP API 提供了无前端依赖的调用路径，方便在命令行工具、脚本或纯后端应用中直接集成。

**典型例子**

- 一款定理验证工具通过结构化协议生成图形，再调用渲染能力输出结果图。
- 一款数学实验应用通过 SDK 控制参数变化，并实时展示对应图像变化。
- 一个命令行脚本批量接收自然语言题目描述，通过智能生图接口生成几何项目并渲染为 PNG 存档。

## 如何选择接入路径

| 你的目标                                   | 建议先看                                                                                                                |
| :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| 只想先展示动态图形                         | <a href="./capabilities.html#capability-embedded-presentation" target="_blank" rel="noreferrer">嵌入式演示画板</a>      |
| 需要在自己的系统里编辑和产出图形           | <a href="./capabilities.html#capability-embedded-editor" target="_blank" rel="noreferrer">嵌入式编辑画板</a>            |
| 需要通过代码控制画板和数据流               | <a href="./capabilities.html#capability-sdk-protocol" target="_blank" rel="noreferrer">几何协议与 JS SDK</a>            |
| 需要让 AI 在对话 / 推理中调用几何能力      | <a href="./capabilities.html#capability-ai-agent" target="_blank" rel="noreferrer">AI Agent 几何交互</a>                |
| 需要图片、协议数据等落地结果               | <a href="./capabilities.html#capability-export" target="_blank" rel="noreferrer">图片与结构化导出</a>                   |
| 需要后端批量生成几何图或渲染导出           | <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>                   |
| 需要从文字 / 图片自动生成几何图（无前端）  | <a href="./capabilities.html#capability-api" target="_blank" rel="noreferrer">HTTP API 服务端接入</a>（智能生图接口）   |

## 从场景视角继续阅读

- 想了解每个能力单元本身能做什么：看 <a href="./capabilities.html#capability-summary" target="_blank" rel="noreferrer">能力总览</a>
- 想直接进入工程接入文档：看 [SDK 接入](../sdk/)
- 想先评估 AI / Agent 方向：看 [交互命令能力介绍](../sdk/repl)
- 想接入 HTTP API（智能生图 / 渲染导出）：看 [API 接入](../api/)
- 想接入 MCP / AI 客户端工具：看 [AI 接入](../ai/)
