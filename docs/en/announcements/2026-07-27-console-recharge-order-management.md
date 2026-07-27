---
title: Console Top-up and Order Management Now Available
description: The Dino-GSP Open Platform console now supports self-service top-up, resource pack purchases, WeChat Pay, and order management.
---

# Console Top-up and Order Management Now Available

- Type: New capability
- Published: 2026-07-27
- Effective date: 2026-07-27
- Audience: Customers using points-billed Open Platform capabilities such as APIs and MCP
- Action required: To add points, sign in to the console and open **Top Up**

## What's New

The Open Platform console now provides a self-service top-up and order management system. You can purchase a resource pack or top up points directly, with points automatically issued to the current customer entity after payment.

The launch includes:

1. **Resource pack purchases**: choose a pack based on your usage volume and receive its point multiplier. The pack takes effect as soon as payment and point issuance complete.
2. **Direct point top-up**: top up at `¥1 = 10,000 points`, starting from ¥20. These points do not expire and are suitable for occasional use or a temporary balance increase.
3. **WeChat Pay**: scan the QR code on the order confirmation page. Payment and point issuance progress update on the page.
4. **Order management**: find orders by order number, status, or type, and review the amount, creation time, payment time, and issuance status.
5. **Follow-up actions**: continue payment for pending orders; review resource pack benefits, point issuance records, and payment details for completed orders; contact support when an order is marked abnormal.

## How to Use It

1. Sign in to the [Open Platform console](https://open.dajiaoai.com/console/dashboard).
2. Open **Top Up** from the left navigation.
3. Select a resource pack or direct point top-up, confirm the order, and scan with WeChat to pay.
4. After payment, check the available balance on **Top Up**, or open **Order Management** for order and issuance details.

API and MCP calls under the same customer entity share one points account. When multiple resource packs are active, points from the earliest-expiring pack are used first. Permanent points are used after resource pack points are exhausted.

## Notes

- A resource pack's validity starts when its points arrive, and multiple packs can remain active at the same time.
- Unpaid orders close automatically when their countdown expires.
- WeChat Pay is currently the supported payment channel.
- Self-service invoicing and refunds are not currently available. Contact support if needed.

## Related Links

- [How to Recharge](/en/guide/recharge)
- [Licensing & Pricing](/en/guide/license-and-pricing)
- [Contact Us](/en/CONTACT)
