---
title: MCP Billing
description: Understand the current billing rules for Dino-GSP MCP and how different tool calls are charged
---

# MCP Billing

This page describes the current billing rules for Dino-GSP MCP.

## Billing rules

| Scenario                | Billing rule                    | Notes                                  |
| :---------------------- | :------------------------------ | :------------------------------------- |
| MCP Server call         | `1` billing point               | Base charge                            |
| Image generation call   | Additional `100` billing points | Added on top of the base charge        |
| File export call        | Additional `1` billing point    | Added on top of the base charge        |
| Other tool capabilities | No extra charge                 | Currently only the base charge applies |

## Typical billing examples

| Call type                                | Base charge | Extra charge | Total                |
| :--------------------------------------- | :---------- | :----------- | :------------------- |
| One regular MCP call                     | `1`         | `0`          | `1` billing point    |
| One conversation that generates an image | `1`         | `100`        | `101` billing points |
| One conversation that exports a file     | `1`         | `1`          | `2` billing points   |

## How to top up

The current exchange rate is `1` CNY = `10000` billing points. Top-ups are currently handled manually through WeChat. If you want to recharge, please scan the QR code below.

![WeChat top-up QR code](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/841edf50-screenshot-20260525-175003.png)

## Current scope

- The additional image-generation charge applies to `export_image`
- The additional file-export charge applies to `export_project`
- Other capabilities such as `algeo_repl` and `import_project` currently only incur the base charge

If the billing rules change later, please refer to the console, official announcements, or the latest documentation.
