---
title: SDK 2.12.0 自定义字体
description: 为 SDK 编辑模式和演示模式配置字体资源、字体选择器和默认字体
---

# 自定义字体

从 SDK `2.12.0` 起，编辑模式和演示模式都可以在创建实例时通过 `fonts` 配置字体。SDK 会在 iframe 就绪后、其它初始化操作前发送字体配置。

通常应使用 URL 加载字体；当字体 URL 无法满足跨域要求时，也可以传入纯 base64 字符串或完整的 data URL。

## 快速接入

::: warning 重要说明
`resources` 仅用于主动加载用户设备中未安装的字体。

Windows 或 macOS 已自带的系统字体无需放入 `resources`，在 `catalog` 中将其声明为 `type: 'system'` 即可。

对于通过 URL 或 base64 主动加载的字体，接入方应自行确认并处理字体的使用许可、网络分发授权，确保使用方式符合相应字体的许可协议。
:::

您可以打开[自定义字体在线案例](https://dajiaoai.github.io/algeo-sdk/examples/18-custom-fonts.html)，修改字体配置并重新执行实例化代码。

```typescript
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(container, {
  auth: { appId: 'YTVJDQZR' },
  fonts: {
    resources: [
      {
        key: 'brand-sans',
        source: {
          type: 'url',
          url: 'https://cdn.example.com/brand-sans.woff2',
          format: 'woff2',
        },
      },
    ],
    catalog: [
      { key: 'brand-sans', name: '品牌字体' },
      { key: 'sans-serif', name: '系统非衬线字体', type: 'system' },
    ],
    defaultFont: 'brand-sans',
  },
});
```

## 类型定义

| **字段说明**  |                                                   |
| ------------- | ------------------------------------------------- |
| `resources`   | 需要在内嵌页面中加载和注册的字体文件。            |
| `catalog`     | 编辑器字体选择器展示的字体及顺序；演示模式可省略。 |
| `defaultFont` | 新建文本使用的默认字体 `key`。                    |

```typescript
type AlgeoFontFormat = 'woff2' | 'woff' | 'truetype' | 'opentype';

type AlgeoFontSource =
  | { type: 'url'; url: string; format?: AlgeoFontFormat }
  | {
      type: 'base64';
      data: string;
      mimeType?: string;
      format?: AlgeoFontFormat;
    };

interface AlgeoFontResource {
  key: string;
  source: AlgeoFontSource;
}

interface AlgeoFontOption {
  key: string;
  name: string;
  type?: 'custom' | 'system';
}

interface AlgeoFontConfig {
  resources?: AlgeoFontResource[];
  catalog?: AlgeoFontOption[];
  defaultFont?: string;
}
```

`key` 同时作为 FontFace family、CSS `font-family` 和文档字体标识。字重、字号和斜体等属于文档排版内容，不通过字体配置传递。

## base64 字体

```typescript
fonts: {
  resources: [
    {
      key: 'brand-sans',
      source: {
        type: 'base64',
        data: fontBase64,
        mimeType: 'font/woff2',
        format: 'woff2',
      },
    },
  ],
  defaultFont: 'brand-sans',
}
```

`data` 支持纯 base64 内容和完整 data URL。base64 会增大初始化数据量，能够配置跨域字体 URL 时应优先使用 URL。

## 字体 URL 与跨域

字体服务器需要允许内嵌页面跨域获取资源。请为字体响应配置正确的 `Access-Control-Allow-Origin` 和 `Content-Type`，并优先使用 HTTPS。无法调整字体服务器响应头时，可改用 base64 来源。
