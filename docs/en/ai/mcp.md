---
title: MCP Integration
description: Connect Dino-GSP MCP to VS Code, Cursor, Claude Code, Codex, and WorkBuddy with Bearer authentication
---

# MCP Integration

MCP (Model Context Protocol) allows AI clients that support the protocol to call Dino-GSP capabilities directly, so geometry operations, export, and project I/O can happen inside an AI conversation.

If your product already includes an AI assistant, agent workflow, or tool-calling runtime, MCP is the standard way to expose Dino-GSP geometry interaction to that layer.

## Service information

- **MCP endpoint**: `https://api.dajiaoai.com/mcp`
- **Authentication**: Bearer Token
- **Header**: `Authorization: Bearer YOUR_TOKEN_HERE`
- **Billing**: [View MCP billing details](./mcp-billing)

## MCP authentication

Before connecting to MCP, you need to obtain a valid Bearer Token from the console.

The process is:

1. Open the <a href="https://open.dajiaoai.com/console/dashboard" target="_blank" rel="noreferrer">Dino-GSP Open Platform console</a>.
2. Register an application.
3. Add an API key under that application.
4. Use the generated API key as the Bearer Token in the request header: `Authorization: Bearer YOUR_TOKEN_HERE`

![Where to find the Bearer Token in the console](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/c04be56c-screenshot-20260525-172351.png)

## Before you connect

Make sure the following are ready:

- Your AI client supports remote MCP servers
- You already have a valid Bearer Token
- Your environment can reach `https://api.dajiaoai.com/mcp`

## MCP capabilities

The currently exposed core capabilities include:

| Tool             | Purpose                                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------------------------- |
| `algeo_repl`     | Execute interactive geometry commands on the current canvas to create, update, or inspect objects        |
| `export_image`   | Export the current project as a PNG image and return an accessible link that remains valid for 1 year    |
| `export_project` | Export the current project as structured JSON and return an accessible link that remains valid for 1 day |
| `import_project` | Import structured JSON project content into the project bound to the current MCP session                 |

In most clients you do not need to memorize tool names. If tool calling is enabled, the model will choose the right tool from natural language requests.

## Available tools

### Codex

When adding the MCP service in Codex, choose `Streamable HTTP` and fill in the following:

- Server URL: `https://api.dajiaoai.com/mcp`
- Header: `Authorization: Bearer YOUR_TOKEN_HERE`

If you are using a Codex environment that supports CLI-based MCP configuration, you can also add the same Bearer header through the corresponding MCP add command.

### Claude Code

Run:

```bash
claude mcp add --transport http dajiao-algeo https://api.dajiaoai.com/mcp --header "Authorization: Bearer YOUR_TOKEN_HERE"
```

After adding the server, run `/mcp` in Claude Code to inspect its status.

### Cursor

Edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "dajiao-algeo": {
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

After saving, return to `Tools & MCP` and confirm that the server loads successfully.

### VS Code

Create or edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "dajiao-algeo": {
      "type": "http",
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

You can also add the server from the command palette. Choose `HTTP (HTTP or Server-Sent Events)` and provide the same Bearer header.

### WorkBuddy

Open the MCP configuration page in WorkBuddy and add the following:

```json
{
  "mcpServers": {
    "dajiao-algeo": {
      "type": "http",
      "url": "https://api.dajiaoai.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      },
      "disabled": false
    }
  }
}
```

After saving, return to the MCP list and confirm that the service loads successfully.

## Example prompts

![MCP agent conversation example](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/98536196-screenshot-20260525-171357.png)

## FAQ

### 1. What should I check if I get 401 or cannot list tools?

Check the following first:

- The `Authorization` header is present
- The value includes the exact `Bearer ` prefix
- The endpoint is exactly `https://api.dajiaoai.com/mcp`
