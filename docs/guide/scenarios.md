---
title: 适用场景
description: 从业务场景理解大角几何开放平台适合怎样的接入需求，以及每种场景推荐使用哪些能力单元
---

# 适用场景

如果你更习惯从“我在做什么产品”出发，这一页更适合你。每个场景都对应推荐的能力单元，并给出一个典型接入例子，帮助你快速判断是否匹配。

## 如何阅读这一页

- 想先判断产品是否适配：直接看你最接近的业务场景。
- 想知道该接哪些能力：看每个场景下的“推荐能力单元”。
- 想先理解能力边界：再回到 [能力总览](./capabilities#capability-summary) 查看每个能力单元的详细说明。

<a id="scenario-mapping"></a>

## 场景与能力的对应关系

| 场景                     | 核心诉求                                   | 推荐能力单元                                                                                                                                                                         |
| :----------------------- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 在线教育与智慧课堂       | 让抽象几何知识在教学页面中动态呈现         | [嵌入式演示画板](./capabilities#capability-embedded-presentation)、[AI Agent 几何交互](./capabilities#capability-ai-agent)                                                           |
| 数字化题库与内容平台     | 降低题图生产成本，增强题目交互性           | [嵌入式演示画板](./capabilities#capability-embedded-presentation)、[几何协议与 JS SDK](./capabilities#capability-sdk-protocol)、[图片与结构化导出](./capabilities#capability-export) |
| AI 智能辅导              | 让模型边推理边作图，输出更生动的几何讲解   | [AI Agent 几何交互](./capabilities#capability-ai-agent)、[几何协议与 JS SDK](./capabilities#capability-sdk-protocol)                                                                 |
| 教案与课件生产工具       | 让教研团队在自己的系统中生产几何内容       | [嵌入式编辑画板](./capabilities#capability-embedded-editor)、[图片与结构化导出](./capabilities#capability-export)                                                                    |
| 独立开发者与数学创新工具 | 直接复用成熟几何基础设施，聚焦自身创新逻辑 | [几何协议与 JS SDK](./capabilities#capability-sdk-protocol)、[图片与结构化导出](./capabilities#capability-export)                                                                    |

<a id="scenario-online-education"></a>

## 1. 在线教育与智慧课堂

这是最典型的教学展示场景。核心目标是把动态几何能力无缝放进课堂和学习流程里。

**你可能在做什么产品**

- 在线课堂
- 互动讲义
- 课件播放系统
- 学习平板或课堂大屏

**推荐能力单元**

- [嵌入式演示画板](./capabilities#capability-embedded-presentation)
- [AI Agent 几何交互](./capabilities#capability-ai-agent)

**为什么适合**

- 可以把静态题图升级为可拖动、可演示、可播放的动态内容。
- 如果你的课堂系统带 AI 助教，还可以让 AI 在讲解时同步画图。

**典型例子**

- 教师在讲解全等三角形时，课堂页面内直接展示一个可拖动顶点的动态图。
- AI 助教在讲题时，一边输出文字解析，一边自动补出辅助线。

<a id="scenario-question-bank"></a>

## 2. 数字化题库与内容平台

这一类场景往往内容量大、更新频繁，人工为每道题做静态图成本很高。更合适的方式是把几何内容结构化，再按需渲染、交互和导出。

**你可能在做什么产品**

- 题库平台
- 搜题解析页
- 习题练习系统
- 教辅内容中台

**推荐能力单元**

- [嵌入式演示画板](./capabilities#capability-embedded-presentation)
- [几何协议与 JS SDK](./capabilities#capability-sdk-protocol)
- [图片与结构化导出](./capabilities#capability-export)

**为什么适合**

- 既可以在前台展示动态题图，也可以在后台用代码批量处理几何内容。
- 适合把题目、图形、导出结果接入现有题库工作流。

**典型例子**

- 题库详情页加载可交互图形，学生通过拖动验证结论是否成立。
- 运营后台根据结构化数据批量生成题图缩略图和展示图。

<a id="scenario-ai-tutoring"></a>

## 3. AI 智能辅导

这个场景的关键是“让 AI 真正拥有几何操作能力”。如果模型只能输出文字，它在讲解几何题时的表现会很枯燥。

**你可能在做什么产品**

- AI Tutor
- 智能答疑
- 自动解题与讲解产品
- Agent 驱动的数学学习助手

**推荐能力单元**

- [AI Agent 几何交互](./capabilities#capability-ai-agent)
- [几何协议与 JS SDK](./capabilities#capability-sdk-protocol)

**为什么适合**

- 模型可以把作图过程纳入推理链，让图形成为讲解上下文的一部分。
- 可以实时读取图形状态，支持更强的诊断、讲解和追问能力。

**典型例子**

- AI 在讲“证明圆周角相等”时，自动构造圆、弦和对应角，并逐步展示证明辅助图。
- 智能答疑系统根据学生在画板上的拖动结果，判断其是否真正理解了几何关系。

<a id="scenario-authoring-tools"></a>

## 4. 教案与课件生产工具

这个场景面向的是内容生产者。重点在于提升制作效率、减少重复劳动，并让内容在系统之间更容易流转。

**你可能在做什么产品**

- 教案编写平台
- 课件制作工具
- 教研协同系统
- 内容生产后台

**推荐能力单元**

- [嵌入式编辑画板](./capabilities#capability-embedded-editor)
- [图片与结构化导出](./capabilities#capability-export)

**为什么适合**

- 可以把专业几何编辑能力直接放进内容生产流程，不用跳出系统单独制图。
- 图形既能导出图片交付，也能保留结构化结果便于后续再编辑。

**典型例子**

- 教师在备课系统里直接插入并编辑几何图，完成后导出到课件页面。
- 教研团队在内容平台中沉淀可复用的结构化几何素材库。

<a id="scenario-independent-developers"></a>

## 5. 独立开发者与数学创新工具

如果你的产品创新点不在“重新造一个几何引擎”，而在新的交互方式、分析逻辑或学科应用，那么更适合直接复用现成能力单元。

**你可能在做什么产品**

- 函数图像工具
- 定理验证工具
- 数学实验应用
- 垂直学科创新产品

**推荐能力单元**

- [几何协议与 JS SDK](./capabilities#capability-sdk-protocol)
- [图片与结构化导出](./capabilities#capability-export)

**为什么适合**

- 你可以把精力放在自己的核心算法、交互或产品设计上，直接复用底层几何渲染和约束求解能力。
- 更适合快速验证新产品方向，再逐步加深接入深度。

**典型例子**

- 一款定理验证工具通过结构化协议生成图形，再调用渲染能力输出结果图。
- 一款数学实验应用通过 SDK 控制参数变化，并实时展示对应图像变化。

## 如何选择接入路径

| 你的目标                         | 建议先看                                                          |
| :------------------------------- | :---------------------------------------------------------------- |
| 只想先展示动态图形               | [嵌入式演示画板](./capabilities#capability-embedded-presentation) |
| 需要在自己的系统里编辑和产出图形 | [嵌入式编辑画板](./capabilities#capability-embedded-editor)       |
| 需要通过代码控制画板和数据流     | [几何协议与 JS SDK](./capabilities#capability-sdk-protocol)       |
| 需要让 AI 调用几何能力           | [AI Agent 几何交互](./capabilities#capability-ai-agent)           |
| 需要图片、协议数据等落地结果     | [图片与结构化导出](./capabilities#capability-export)              |

## 从场景视角继续阅读

- 想了解每个能力单元本身能做什么：看 [能力总览](./capabilities#capability-summary)
- 想直接进入工程接入文档：看 [SDK 接入](../sdk/)
- 想先评估 AI / Agent 方向：看 [交互命令能力介绍](../sdk/repl)
