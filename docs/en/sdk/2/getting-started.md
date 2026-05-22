---
title: SDK 2.x Getting Started
description: Quick start for the newer createPresentation and createEditor entry points
---

# SDK 2.x Getting Started

This guide helps you quickly get started with embedding the Dino-GSP geometry canvas into your web application through the Open Platform.

<iframe
  src="https://dajiaoai.com/embed/edit/YTVJDQZR/33TA3484"
  style="width: 100%; height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  allow="fullscreen"
  title="Algeo SDK Embed Example"
></iframe>

## 1. Installation and Setup

### npm

```bash
npm install @dajiaoai/algeo-sdk@2
```

## 2. Core Concepts

Before using the SDK, understand the two main operating modes:

- **Presentation Mode**: Focuses on interactive content display. Supports loading a share ID or structured file, switching slides, and executing REPL commands.
- **Editor Mode**: Provides a geometry content creation environment. Supports adding/removing slides, UI customization, undo/redo, and save interactions with the host.

## 3. Quick Integration

### Presentation Mode

If you only need to display a geometry figure on your page:

```javascript
import { createPresentation } from '@dajiaoai/algeo-sdk';

// 1. Get the mount container
const container = document.getElementById('algeo-viewer');

// 2. Create and initialize the instance
const presentation = await createPresentation(container, {
  shareId: '33TA3484', // optional: content ID to load on initialization
});

// 3. Further operations (e.g. switch to slide 2 after 3 seconds)
setTimeout(() => {
  presentation.switchSlide(1);
}, 3000);
```

### Editor Mode

If you need to embed an editable drawing tool:

```javascript
import { createEditor } from '@dajiaoai/algeo-sdk';

const editor = await createEditor(document.getElementById('algeo-editor'), {
  auth: { appId: 'YTVJDQZR' }, // required for editor mode
  ui: {
    navbar: true, // top navigation bar toggle
    slidePanel: true, // side slide thumbnail panel toggle
    toolboxPanel: true, // drawing toolbox toggle
  },
});

// Listen for save events
editor.on('save', (event) => {
  console.log('Content saved:', event.content);
});
```

## 4. Getting an appId

Editor Mode requires an `appId` for authentication. Follow these steps to obtain one:

1. **Access Developer Console**: Go to the [Dino-GSP Open Platform Console](https://open.dajiaoai.com/console/dashboard)
2. **Register Application**: Create a new application in the console and fill in the application details
3. **Retrieve Credentials**: The system will generate your `appId`. Copy this ID for use in your SDK configuration

Need help? [Contact us](../../CONTACT).

## 5. FAQ

- **Why does Editor Mode require an appId?** It ensures the legitimacy and security of your application.
- **Does appId expire?** Your appId is valid long-term, but you can manage it in the console.

## 6. Next Steps

- For fine-grained control over canvas elements, read [Presentation Mode Reference](./presentation).
- For implementing complex editor functionality, read [Editor Mode Reference](./editor).
