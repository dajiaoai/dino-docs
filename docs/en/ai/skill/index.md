---
title: Install the Dino-GSP Skill
description: Install the Dino-GSP Skill through SkillHub so agents can use Dino-GSP MCP more reliably
---

# Install the Dino-GSP Skill

The Dino-GSP Skill gives agents MCP tool guidance, drawing rules, and common workflows so they can create, edit, and export geometry more reliably.

The Skill is an instruction layer for MCP. Before installing it, complete **MCP authorization** and confirm that your client can call the Dino-GSP MCP tools.

::: warning Protect your API key
Installing the Skill does not require your API key. Enter the key only in your client's MCP configuration. Do not paste it into a conversation or Skill, or commit it to a repository.
:::

## Requirements

Before you begin, make sure that:

- Your AI client supports Agent Skills and remote MCP servers
- You have created an application in the Dino-GSP Open Platform and obtained an API key
- Dino-GSP MCP is connected and its tools are available in your client

Skill installation and loading vary by client. Follow your client's documentation where its workflow differs.

## Install through SkillHub

SkillHub is a third-party AI Skills community optimized for users in China. Its interface and installation guide are primarily in Chinese. The Dino-GSP listing provides the latest release, description, version history, and download:

<a href="https://skillhub.cn/skills/user_839cf8f8/dino-algeo" target="_blank" rel="noreferrer">View the Dino-GSP Skill on SkillHub</a>

Send the following prompt to your AI to install the latest version using SkillHub's instructions:

```text
Please follow https://skillhub.cn/install/skillhub.md to install @user_839cf8f8/dino-algeo.
```

If prompt-based installation is unavailable, download the ZIP from the SkillHub listing and import it using your client's local Skill installation workflow.

## Verify the installation

After installing and reloading the Skill, send this request to your agent:

```text
Use Dino-GSP to draw an isosceles right triangle, label all three vertices, and export an image.
```

A successful run creates a new Dino-GSP session, draws the figure, and returns an exported image. If a tool call returns `401` or the client cannot find the tools, check the endpoint, Bearer Token, and connection status in the [MCP Integration FAQ](../mcp/#faq).

## Continue reading

- Visit SkillHub for the complete tool guidance, operating rules, and version history
- [Use Master Templates with MCP](../mcp/master-template) to keep backgrounds, axes, and object styles consistent
- [MCP Billing](../mcp/billing) for tool-call costs
