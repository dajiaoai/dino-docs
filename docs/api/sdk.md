# SDK API 参考

## 常量

### VERSION

SDK 版本号字符串，构建时注入。

```javascript
import { VERSION } from '@dajiaoai/algeo-sdk';
console.log('大角几何 SDK version:', VERSION);
```

## 类 AlgeoSdk

### AlgeoSdk.create(container, options?): Promise\<AlgeoSdk\>

异步创建并初始化 SDK 实例。在 iframe 加载完成并收到 ready 消息后 resolve。

| 参数        | 类型              | 说明                    |
| ----------- | ----------------- | ----------------------- |
| `container` | `HTMLElement`     | 挂载 iframe 的 DOM 容器 |
| `options`   | `AlgeoSdkOptions` | 可选配置                |

**AlgeoSdkOptions：**

| 属性        | 类型     | 默认值                   | 说明                                  |
| ----------- | -------- | ------------------------ | ------------------------------------- |
| `baseUrl`   | `string` | `'https://dajiaoai.com'` | 内嵌页基础 URL                        |
| `initialId` | `string` | `''`                     | 初始加载的分享 ID，为空则加载空白画板 |

### 实例属性（只读）

| 属性      | 类型             | 说明                                 |
| --------- | ---------------- | ------------------------------------ |
| `ready`   | `boolean`        | 是否已就绪（收到 iframe ready 通知） |
| `version` | `string \| null` | 内嵌页协议版本                       |

### 实例方法

按使用场景分类，便于快速找到所需能力。

| 我想…            | 方法                            |
| ---------------- | ------------------------------- |
| 加载分享链接内容 | [loadShareById](#loadsharebyid) |
| 导入文件数据     | [loadFile](#loadfile)           |
| 切换画板 / 翻页  | [switchSlide](#switchslide)     |
| 获取画板总数     | [getSlideCount](#getslidecount) |
| 程序化操作画板   | [repl](#repl)                   |
| 销毁并清理       | [destroy](#destroy)             |

---

#### loadShareById

按分享 ID 加载画板内容，适用于已有分享链接的场景。

`loadShareById(id: string)` → `Promise<{ success: true }>`

| 参数 | 说明                     |
| ---- | ------------------------ |
| `id` | 分享 ID，如 `'33TA3484'` |

---

#### loadFile

加载完整文件内容（覆盖式），需符合 FileContentV10 格式。适用于从题库、教材等导入结构化数据。

`loadFile(content: FileContentV10)` → `Promise<{ success: true }>`

| 参数      | 说明                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| `content` | 文件内容对象，类型定义见 [algeo-protocol 仓库](https://github.com/dajiaoai/algeo-protocol) |

---

#### switchSlide

切换到指定索引的画板（索引从 0 开始）。适用于多页画板、幻灯片式展示。

`switchSlide(index: number)` → `Promise<{ success: true }>`

| 参数    | 说明                |
| ------- | ------------------- |
| `index` | 画板索引，从 0 开始 |

---

#### getSlideCount

查询当前加载内容中的画板总数。常用于配合 `switchSlide` 实现翻页、导航。

`getSlideCount()` → `Promise<{ count: number }>`

---

#### repl

执行 REPL 单条命令。REPL 是画板的交互式命令接口，面向 AI 与开发者提供对画板的完整操作能力：画板管理、定义几何对象、查询状态、样式控制等。输出为面向 AI 的文档/文本格式（表格、结构化文本），便于解析和决策。

详见 [REPL 能力](../guide/repl)。

`repl(command: string)` → `Promise<{ output: string }>`

| 参数      | 说明                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `command` | 单条 REPL 命令，如 `help`、`list`、`list_slides`、`def A := Point(0,0)` 等 |

---

#### destroy

移除 iframe 与事件监听，并拒绝所有未完成的请求。在组件卸载时调用。

`destroy()` → `void`
