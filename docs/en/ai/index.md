---
title: AI Access
description: Entry point for AI-native integration methods such as MCP, Skills, and CLI
---

# AI Access

AI Access is designed for products and teams that already work with large models, agents, copilots, or automated workflows. The goal is not to embed the geometry canvas into your front end, but to let AI call Dino-GSP capabilities directly during conversations, reasoning flows, and automated execution.

If you want AI to draw, export, or manipulate geometry as part of a tutoring, explanation, or automation flow, this is the primary entry point.

## Best-fit scenarios

- AI tutors or explanation assistants that draw while reasoning
- Agent workflows that generate geometry, export images, or export project files automatically
- Integrations for AI clients such as VS Code, Cursor, Claude Code, Codex, and WorkBuddy
- Products that want geometry as part of an AI toolchain rather than a traditional front-end SDK flow

## Recommended reading path

If you are getting started, read in this order:

1. Start with [MCP Integration](./mcp) to understand authentication, client configuration, and available capabilities.
2. Then review [MCP Billing](./mcp-billing) to confirm usage cost and top-up details.

## Current integration modes

### MCP

MCP is the currently available and most complete AI integration method. It fits clients and agent runtimes that support remote MCP, exposing Dino-GSP capabilities as callable tools through a standard protocol.

### Skills

Skills documentation is not available yet. It will be added later for workflow composition and packaged capability use cases.

### CLI

CLI documentation is not available yet. It will be added later for command-line and automation-oriented access patterns.

## How it differs from SDK Access

AI Access focuses on letting models or agents call geometry capabilities directly. SDK Access focuses on letting your own front end or application control canvas lifecycle, events, and data flow. If your main goal is “make geometry usable by AI,” start here. If your main goal is “embed the canvas into my product UI,” start with <a href="/en/sdk/" target="_blank" rel="noreferrer">SDK Access</a>.
