---
title: 画板插入图片素材
description: 通过 SDK 2.11.0 的 resourceLibrary Provider，把接入方自有图片素材库接入内嵌编辑器并插入画板。
---

# 画板插入图片素材

SDK `2.11.0` 起，接入方可以把自己的图片素材库接入内嵌编辑器。图片仍由接入方存储、分类和鉴权；当用户在编辑器中浏览、搜索或翻页时，SDK 调用宿主提供的 `resourceLibrary.query()`，再由编辑器展示返回的图片并将用户选中的素材插入画板。

![](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/5a8936a4-2abe59cd52c2d2f6c2630de0cba69769.png)

## 交互演示

<iframe
  src="https://dajiaoai.com/embed/present/YTVJDQZR/WJOKAUNE"
  style="width: 100%; height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  allow="fullscreen"
  title="图片素材库演示示例"
></iframe>

::: tip 在线体验
示例展示了完整的 Provider 配置、分页搜索、取消请求和协议数据结构。

**[打开自有图片素材库示例 →](https://dajiaoai.github.io/algeo-sdk/examples/17-resource-library.html)**
:::

## 接入流程

1. 接入方后端提供图片素材查询接口。
2. 宿主页面创建编辑器时传入 `resourceLibrary`。
3. 编辑器需要素材数据时调用 `resourceLibrary.query(params, context)`。
4. 宿主查询自己的后端，并按 SDK 协议返回图片列表和分页信息。
5. 用户在编辑器中选择图片，编辑器将原图 URL 对应的素材插入当前画板。

未配置 `resourceLibrary` 时，内嵌编辑器不会展示图片素材入口。

![](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/a7f481b7-QQ20260817-153403.png)

## 完整示例

```typescript
import {
  createEditor,
  type ResourceLibraryProvider,
} from '@dajiaoai/algeo-sdk';

const resourceLibrary: ResourceLibraryProvider = {
  async query(params, { signal }) {

    const search = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });

    if (params.keyword) {
      search.set('keyword', params.keyword);
    }
    if (params.mediaTypes?.length) {
      search.set('mediaTypes', params.mediaTypes.join(','));
    }

    // 接入方实现自己业务的资源查询接口
    const response = await fetch(`/api/materials?${search}`, { signal });
    if (!response.ok) {
      throw new Error(`素材查询失败：${response.status}`);
    }

    const data = await response.json();

    return {
      items: data.items.map((item) => ({
        id: item.id,
        name: item.name,
        mediaType: item.mimeType,
        url: item.originalUrl,
        thumbnailUrl: item.thumbnailUrl,
        width: item.width,
        height: item.height,
        size: item.size,
      })),
      pageInfo: {
        page: params.page,
        pageSize: params.pageSize,
        hasNext: data.hasNext,
        total: data.total,
      },
    };
  },
};

const editor = await createEditor(
  document.getElementById('algeo-editor')!,
  {
    auth: { appId: 'YOUR_APP_ID' },
    resourceLibrary,
  },
);
```

`query` 运行在宿主页面中，因此可以复用宿主已有的登录态，也可以请求宿主自己的后端，由后端完成权限判断并返回当前用户可见的素材。

## Provider 协议

```typescript
interface ResourceLibraryProvider {
  query(
    params: ResourceLibraryQuery,
    context: ResourceLibraryQueryContext,
  ): Promise<ResourceLibraryResult>;
}

interface ResourceLibraryQueryContext {
  signal: AbortSignal;
}
```

### 查询参数

```typescript
interface ResourceLibraryQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  mediaTypes?: string[];
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 页码，从 `1` 开始。 |
| `pageSize` | `number` | 每页数量，必须是正整数，最大为 `100`。 |
| `keyword` | `string` | 可选的搜索关键词。接入方可按名称、标签等业务字段匹配。 |
| `mediaTypes` | `string[]` | 可选的媒体类型过滤条件；当前素材库仅支持图片。 |

宿主不应自行修改 `page` 和 `pageSize`。返回结果中的分页字段必须与本次请求一致。

### 返回结果

```typescript
interface ResourceLibraryResult {
  items: ResourceLibraryItem[];
  pageInfo: ResourceLibraryPageInfo;
}

interface ResourceLibraryItem {
  id: string;
  name: string;
  mediaType: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size?: number;
}

interface ResourceLibraryPageInfo {
  page: number;
  pageSize: number;
  hasNext: boolean;
  total?: number;
}
```

#### 图片字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 素材 ID，不能为空；同一次查询返回的列表中不能重复。建议在素材生命周期内保持稳定。 |
| `name` | 是 | 素材名称，不能为空。 |
| `mediaType` | 是 | 图片 MIME 类型，必须以 `image/` 开头，例如 `image/png`、`image/jpeg`。 |
| `url` | 是 | 原图的完整 HTTP(S) URL，用户选择素材后用于插入画板。 |
| `thumbnailUrl` | 否 | 缩略图的完整 HTTP(S) URL；未提供时可使用原图展示。 |
| `width` | 否 | 原图像素宽度，提供时必须是正整数。 |
| `height` | 否 | 原图像素高度，提供时必须是正整数。 |
| `size` | 否 | 文件字节数，提供时必须是正整数。 |

#### 分页字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 是 | 必须等于本次查询的 `params.page`。 |
| `pageSize` | 是 | 必须等于本次查询的 `params.pageSize`。 |
| `hasNext` | 是 | 是否还有下一页。 |
| `total` | 否 | 符合当前查询条件的素材总数，提供时必须是大于或等于 `0` 的整数。 |

SDK 会在把结果交给编辑器之前校验这些字段。协议不合法时，本次查询失败，素材不会展示。

## 正确处理取消请求

搜索条件变化、素材面板关闭或 SDK 实例销毁时，先前的请求可能已经失效。SDK 会通过 `context.signal` 通知宿主取消请求。请把 `signal` 传给支持取消的异步 API：

```typescript
const resourceLibrary: ResourceLibraryProvider = {
  async query(params, { signal }) {
    const response = await fetch('/api/materials/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      throw new Error('素材查询失败');
    }

    return response.json();
  },
};
```

请求被取消后不需要返回空列表，也不需要向用户显示错误。`fetch` 会结束请求，SDK 不再把该请求的结果发送给编辑器。

## 图片存储与鉴权建议

`resourceLibrary.query()` 负责查询鉴权，但编辑器随后需要通过 `url` 和 `thumbnailUrl` 加载图片本身。接入时请注意：

- URL 必须能从用户浏览器访问，不能是仅宿主服务器内网可访问的地址。
- `thumbnailUrl` 可指向低分辨率缩略图以提升列表加载速度，`url` 应指向要插入画板的原图。
- 当前协议不支持为单张图片附加自定义请求头。如果图片服务必须通过请求头鉴权，请由宿主后端签发临时 URL，或提供可由浏览器直接访问的素材代理地址。

## 错误处理

查询失败时直接抛出 `Error`，SDK 会把错误信息返回给内嵌编辑器：

```typescript
if (!response.ok) {
  throw new Error('素材服务暂时不可用，请稍后重试');
}
```

不要在失败时返回不完整的 `items` 或 `pageInfo`。这类数据会被 SDK 判定为协议错误，反而不利于定位问题。


## 常见问题

### 为什么编辑器里没有图片素材入口？

请确认创建编辑器时传入了 `resourceLibrary`，并且使用的是 SDK `2.11.0` 或更高版本。未配置 Provider 时，入口会自动隐藏。

### 可以返回视频、音频或文档吗？

暂不支持，有需要请向我们反馈。当前 SDK 会校验 `mediaType`，只有以 `image/` 开头的图片素材可以通过校验。
