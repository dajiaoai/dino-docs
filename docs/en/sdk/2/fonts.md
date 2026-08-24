---
title: Custom Fonts in SDK 2.12.0
description: Configure font resources, the font picker catalog, and the default font for editor and presentation modes
---

# Custom Fonts

Starting with SDK `2.12.0`, both editor and presentation modes accept a `fonts` option when an instance is created. The SDK sends the font configuration after the iframe is ready and before other initialization operations.

Use a URL in most cases. If the font server cannot meet cross-origin requirements, you can pass either a plain base64 string or a complete data URL.

## Quick Setup

::: warning Important
Use `resources` only for fonts that must be loaded because they are not installed on the user's device.

Fonts bundled with Windows or macOS do not need to be included in `resources`; declare them in `catalog` with `type: 'system'`.

For fonts loaded through a URL or base64, the integrator is responsible for obtaining and complying with all applicable usage and web distribution licenses.
:::

Open the [Custom Fonts live example](https://dajiaoai.github.io/algeo-sdk/examples/18-custom-fonts.html) to edit the font configuration and rerun the initialization code.

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
      { key: 'brand-sans', name: 'Brand Sans' },
      { key: 'sans-serif', name: 'System Sans Serif', type: 'system' },
    ],
    defaultFont: 'brand-sans',
  },
});
```

## Type Definitions

| **Field**     | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `resources`   | Font files to load and register in the embedded page.                        |
| `catalog`     | Fonts and ordering shown in the editor's font picker; presentation mode may omit it. |
| `defaultFont` | Font `key` used for newly created text.                                      |

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

The `key` is used as the FontFace family, CSS `font-family`, and document font identifier. Font weight, size, and italic styling are document layout content and are not passed in the font configuration.

## Base64 Fonts

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

`data` accepts plain base64 content or a complete data URL. Base64 increases the initialization payload, so prefer a cross-origin-capable font URL when possible.

## Font URLs and CORS

The font server must allow the embedded page to fetch the resource across origins. Configure the font response with the appropriate `Access-Control-Allow-Origin` and `Content-Type` headers, and prefer HTTPS. Use a base64 source if the server headers cannot be changed.
