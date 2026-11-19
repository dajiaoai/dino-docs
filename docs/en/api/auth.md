---
title: Authentication
description: Describe Dino Geometry Open Platform API authentication and common error handling.
---

# Authentication

Dino Geometry Open Platform APIs use Bearer API Key authentication.

## Getting an API Key

1. Go to the [Console](https://open.dajiaoai.com/console/dashboard)
2. Create an application
3. Open the application details page and create an API Key

![Create API Key](https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/d5c3f461-20260611-180315.jpg)

## Usage

Include the key in every request header:

```http
Authorization: Bearer djo_xxx
```

## Common errors

HTTP `401` means the Bearer header is missing or malformed, or the API key is invalid or inactive.

See the [API Error Codes](/en/api/error-codes#auth-billing) for the full list.
