# Getting Started

This guide explains how to embed the Algeo geometry canvas in your web application via the SDK. It applies to teaching systems, online question banks, educational apps, and other scenarios that require geometry interactivity.

## Installation

### npm

```bash
npm install @dajiaoai/algeo-sdk
```

### CDN

```html
<script src="https://unpkg.com/@dajiaoai/algeo-sdk@1.2.0/dist/algeo-sdk.umd.js"></script>
```

## Basic Usage

### Option 1: SDK (Recommended)

```javascript
import { AlgeoSdk } from '@dajiaoai/algeo-sdk';

const container = document.getElementById('algeo-container');
const sdk = await AlgeoSdk.create(container, {
  initialId: '33TA3484', // optional, initial share ID to load
});

// Call methods
sdk.loadShareById('33TA3484').then(() => console.log('Loaded'));
sdk.getSlideCount().then(({ count }) => console.log('Slide count:', count));
sdk.switchSlide(2).then(() => console.log('Switched slide'));

// Destroy
// sdk.destroy();
```

### Option 2: Direct iframe

No SDK required. Specify the share ID directly in the iframe `src`:

```html
<iframe
  id="algeo-embed"
  src="https://dajiaoai.com/e/33TA3484"
  allow="fullscreen"
></iframe>
```

For dynamic loading, slide switching, and other capabilities, use Option 1 (SDK).

## Configuration Options

| Property    | Type     | Default | Description                                                       |
| ----------- | -------- | ------- | ----------------------------------------------------------------- |
| `initialId` | `string` | `''`    | Initial share ID to load; empty for a blank canvas                |

## Error Handling

All async methods reject with `AlgeoSdkError` on failure:

```javascript
try {
  await sdk.loadShareById('invalid');
} catch (e) {
  if (e.name === 'AlgeoSdkError') {
    console.error(e.code, e.message, e.details);
  }
}
```

Common error codes: `IFRAME_NOT_READY`, `TIMEOUT`, `DESTROYED`, `BAD_REQUEST`. See [Protocol](./api/protocol#error-codes) for the full list.

## More Examples

The SDK package includes an `examples` directory with basic embedding, SDK usage, slide switching, loadFile, REPL, and more. Run `npx serve .` in the `packages/algeo-sdk` directory to try them locally.
