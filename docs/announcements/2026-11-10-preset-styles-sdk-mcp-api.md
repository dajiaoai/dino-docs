---
title: 预设样式上线：SDK、MCP、API 均已支持
description: 生成图形时，重点、辅助、对比、标题、正文等自动配好样式；切换主题，整张图一起换风格。SDK、MCP、API 均已支持，SDK 2.16.0 同时新增母版面板显示与数据配置。
date: "2026-11-10"
modules: [sdk, api, mcp]
topics: [templates, editing, ai]
---

# 预设样式上线：SDK、MCP、API 均已支持

- 类型：能力上新
- 发布时间：2026-11-10
- 生效时间：2026-11-10
- 影响范围：使用 SDK、MCP、智能生图 API 与渲染 API 的开发者
- 是否需要操作：沿用现有母版接入方式，换用包含预设样式的母版，并为图元指定对应语义；SDK 母版面板需升级至 2.16.0 并开启配置

<br/>

**生成图形时，重点、辅助、对比、标题、正文等自动配好样式；切换主题，整张图一起换风格。**


![同一张三角形图在黑白试题与彩色 PPT 两种母版下的预设样式对比，强调、辅助、对照、标题与正文随母版统一变化](/announcements/2026-11-10-preset-styles/template-style-comparison.png)


## 从统一默认样式，到按语义配置风格

原本的母版可以按图元类型统一设置默认样式，例如所有点、线、文本各用一套默认配置。现在，母版还可以包含多个预设样式，为图元赋予“强调”“辅助”“对照”“标题”“正文”等语义，每种语义都有自己的风格定义。

![大角几何母版与预设样式面板：左侧选择系统母版，右侧分别配置标题、正文、强调、辅助、对照等预设](/announcements/2026-11-10-preset-styles/template-presets-panel.png)

*母版包含多种预设样式，每种语义可分别定义风格。*

| 图形中的用途 | 可使用的预设样式 | 作用 |
| --- | --- | --- |
| 需要突出显示的点、线或区域 | 强调 | 让读者快速找到重点 |
| 辅助线、辅助点 | 辅助 | 与主要图形区分，保留构图关系 |
| 用于比较的对象 | 对照 | 便于识别不同对象或状态 |
| 图形标题与说明文字 | 标题、正文 | 统一文字层级与排版 |

预设样式名称和具体效果由母版定义。生成图形时，可以让 AI 按这些语义分配样式；编辑已有图形时，也可以选中对象，在样式风格选项中选择相应预设。

![选中点 B 后，可在浮动工具栏的样式下拉框或右侧样式风格字段中为对象选择预设样式](/announcements/2026-11-10-preset-styles/object-preset-selector.png)



## 沿用现有 template 接入方式




预设样式包含在母版数据中，SDK、MCP、API 继续使用已有的母版（`template`）能力接入，完全兼容旧数据。

1. 打开[母版管理](https://dajiaoai.com/master-templates)，导出包含所需预设样式的现有母版；也可以进入[大角几何主站](https://dajiaoai.com/)自行编辑、保存母版，再导出数据。
![母版编辑页：高亮默认样式、强调、辅助、对照、区域、标题、正文等样式 Tab，以及添加风格组按钮](/announcements/2026-11-10-preset-styles/template-editor-highlighted.png)
2. 按原有方式加载或传入完整母版数据。
3. 作图时指定图元的语义，使用母版中已有的预设名称。

| 接入方式 | 使用入口 |
| --- | --- |
| SDK 编辑或演示模式 | 继续调用 `mode.setMasterTemplate(template)`，传入完整母版 JSON 字符串 |
| MCP | 继续使用 `load_template` 加载母版，再让 AI 按预设样式作图 |
| 智能生图 API | 创建任务时通过 `template` 传入母版 JSON 字符串，在作图描述中说明各对象的语义 |
| 渲染 API | 继续通过 `template` 传入母版对象，按工程中图元的预设样式设置渲染 |



## SDK 2.16.0：显示母版面板，配置自有母版数据

SDK 编辑模式新增母版面板支持。接入方可以开启画板左侧的「母版」入口，并通过回调提供自己的系统母版列表，让用户在内嵌编辑器中预览和应用母版。

- 通过 `ui.masterTemplatePanel: true` 显示母版面板，默认关闭。
- 通过 `masterTemplates.listSystem` 提供系统母版列表，每项包含 `id`、`name` 和完整母版 JSON 字符串 `content`。
- 数据可以来自宿主接口或本地母版文件，便于复用已有的母版管理流程。

![SDK 母版示例：内嵌编辑器显示系统母版列表，可预览并应用黑白排版或彩色 PPT 动态讲解母版](/announcements/2026-11-10-preset-styles/sdk-template-panel.png)

使用此能力请升级至 **SDK 2.16.0**；自托管内嵌页面需同步更新。完整代码与字段说明见[系统母版面板](/sdk/2/master-templates)。

## 立即体验

- [SDK 母版示例](https://dajiaoai.github.io/algeo-sdk/examples/15-presentation-master-template.html?mode=editor)：预览和应用示例母版，也可手动填写母版 JSON，体验整图风格切换。
- [智能生图 API 在线测试](/api/agent-create)：打开页面中的 Playground，传入母版和作图描述，测试按语义生成图形。
- [PNG 渲染 API 在线测试](/api/render-v2)：打开 Playground，传入工程内容与母版，查看预设样式的渲染效果。
- [母版管理](https://dajiaoai.com/master-templates)：获取现有母版数据，或管理自己编辑保存的母版。
- [在 MCP 中使用母版](/ai/mcp/master-template)：通过 AI 对话加载母版并作图。
- [SDK 2.16.0 发布说明](https://github.com/dajiaoai/algeo-sdk/releases/tag/2.16.0)
