# Dino-GSP Open Platform

Dino-GSP is committed to becoming the **geometry capability infrastructure**, enabling geometry drawing and understanding to be embedded in more products and systems through componentization, API-ization, and Agent-ization. For math and geometry capabilities, turn to Dino-GSP.

## Available Capabilities

### SDK Integration: Embedded Geometry Canvas

With `@dajiaoai/algeo-sdk`, you can embed a geometry canvas in any web container with rich interactive capabilities:

- **Low integration cost**: Create an embedded canvas by binding to a DOM container; integration takes < 1 day
- **Full interactivity**: Supports loading files, switching canvases, REPL commands, and more

**Quick start:**

```bash
npm install @dajiaoai/algeo-sdk
```

```javascript
import { AlgeoSdk } from '@dajiaoai/algeo-sdk';

const sdk = await AlgeoSdk.create(document.getElementById('container'));
sdk.loadShareById('33TA3484');
```

See [Getting Started](./guide/getting-started) and [SDK API Reference](./api/sdk).

## Planned Capabilities (Coming Soon)

The following capabilities are under development. Stay tuned:

| Capability        | Positioning                          | Typical Use Cases                                                                 |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| **API Services**  | Upstream geometry content production | Cloud rendering (DSL → PNG/SVG/TikZ), AI image generation, batch and offline rendering |
| **AI Geometry**   | "Geometry expert" in AI systems      | AI problem solving, intelligent tutoring, geometry operations in multi-step reasoning, MCP Server callable by LLM/Agent |
| **Geometry Render API** | Promoting DSL as the de facto content standard | Text/structured input → geometry graphics, locking question banks, textbooks, content production pipelines |

Through open platform capabilities and partnerships, we aim to embed Dino-GSP in more teaching systems, online question banks, and AI products, expanding the reach of geometry capabilities.

## Documentation

| Document                                | Description                                                       |
| --------------------------------------- | ----------------------------------------------------------------- |
| [Getting Started](./guide/getting-started) | SDK installation, basic usage, configuration, and error handling |
| [SDK API](./api/sdk)                    | loadShareById, loadFile, switchSlide, getSlideCount, repl         |
| [REPL Capabilities](./guide/repl)       | REPL command categories, geometry types, output format, syntax constraints |
| [Protocol](./api/protocol)              | FileContentV10 structure, error codes                             |
