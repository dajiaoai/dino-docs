---
title: SDK Authorization
description: Learn about local SDK 2.x use, application registration, and domain allowlist checks.
---

# SDK Authorization

SDK 2.x uses the host page opened in the browser and `auth.appId` to determine how to authorize an integration.

| Host page | Without `auth.appId` | With `auth.appId` |
| --- | --- | --- |
| Local HTML file (`file://`) | Available directly | Use a local HTTP server to test the domain allowlist |
| Local server (`localhost` or `127.0.0.1`) | Available directly | Validates the application and host name |
| Public or LAN address | `auth.appId` is required | Validates the application and host name |

## Register and test an application

1. Create an application in the [Open Platform Console](https://open.dajiaoai.com/console) and copy its application ID.
2. Add the host name shown in the browser to the application's domain allowlist. For example, add `localhost` and open the page at `http://localhost:5173`. The check uses the host name without the port or path.
3. Pass `auth: { appId: 'YOUR_APP_ID' }` to `createEditor` or `createPresentation` and await initialization. Initialization reports an error when the configuration does not match.
4. Before release, add the production host name to the allowlist and test the deployed address. Public and LAN agent preview URLs are checked against the host name shown in the browser.

## Troubleshoot authorization

- If `appId` is missing, check the host address and confirm `auth.appId` is set for the selected mode. When using `create`, put `auth` under `editor` or `presentation`.
- If the allowlist check fails, verify the application ID and the exact host name. `localhost` and `127.0.0.1` are matched separately.
- To verify application authorization for a page opened with `file://`, serve it over local HTTP and try again.
