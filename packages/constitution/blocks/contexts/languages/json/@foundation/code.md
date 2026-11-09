# Code

> Governs any JSON no other chapter governs: the syntax a file is written in.

## Syntax

### json-file-holds-strict-json · MUST

Every `.json` file is strict JSON, as RFC 8259 defines it, with no comment and no trailing comma. A file that holds either is JSONC and ends in `.jsonc`. Exempt: a file its readers find only by a fixed name, when every one of them takes comments.

#### Why

A strict reader refuses the whole file for one comment, as a linter may refuse one in its own configuration, a file several tools read is read by the strictest of them, and every editor and formatter that trusts the `.json` extension reports a comment as an error or strips it — RFC 8259.

#### Examples

```text title="Avoid"
fixtures/order.json
{
  "orderId": "ord_1042",
  "lines": [
    { "sku": "notebook", "quantity": 2 }, // gift-wrapped
  ],
}
```

```text title="Prefer"
fixtures/order.json
{
  "orderId": "ord_1042",
  "lines": [
    { "sku": "notebook", "quantity": 2, "giftWrapped": true }
  ]
}
```
