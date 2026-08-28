---
title: AI Access
description: Use MCP to give AI agents Dino-GSP geometry capabilities, with guidance for authorization, Skills, templates, and billing
---

# AI Access

This section is for products and teams that already use large models, agents, copilots, or automated workflows. With MCP, AI can create, modify, inspect, and export geometry during conversations, reasoning, and automated execution.

## Best-fit scenarios

- AI tutors or explanation assistants that draw while reasoning
- Agent workflows that generate geometry, export images, or export project files automatically
- Geometry tools in remote-MCP clients such as Codex, Claude Code, Cursor, VS Code, and WorkBuddy

## Recommended integration path

For a first integration, complete these steps in order:

1. [Authorize and connect MCP](./mcp/). Create an application in the Open Platform, obtain an API key, and configure it as a Bearer token in your AI client.
2. Confirm that MCP is connected in your client and that the Dino-GSP tools are available. You can then ask AI to draw, inspect, or export geometry.
3. Optionally [install the Dino-GSP Skill](./skill/). It adds tool guidance, drawing rules, and common workflows so agents handle complex tasks more reliably.
4. When you need consistent backgrounds, axes, and object styles, use [MCP master templates](./mcp/master-template).
5. Before launching or estimating usage, review [MCP Billing](./mcp/billing).

::: tip
MCP is the required integration that gives AI geometry operations. The Skill is an optional knowledge package installed after MCP is authorized and connected; it does not provide authorization or replace the MCP service.
:::

## Documentation guide

| Document | Read it when | It answers |
| --- | --- | --- |
| [MCP Integration](./mcp/) | Your first integration | How to authorize, configure a client, and verify tools are available |
| [Install the Dino-GSP Skill](./skill/) | MCP is ready; recommended | How to give an agent more reliable drawing rules and tool guidance |
| [Use Master Templates with MCP](./mcp/master-template) | You need a consistent visual style | How to apply templates to existing or future canvases |
| [MCP Billing](./mcp/billing) | Before launch or cost evaluation | How tool calls are charged and how to top up |
