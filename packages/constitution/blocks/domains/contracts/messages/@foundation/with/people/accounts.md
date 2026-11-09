# Accounts

> Governs the identity a message acts for.

## Identity

### message-carries-the-identity-it-acts-for · MUST

Every message carries the identity it triggers work for: the person or the tenant on whose behalf its message consumer acts.

#### Why

A message consumer handed no identity has only its own service identity to act with, which can reach every tenant, so the rights of the person who caused the work are lost on the way.

#### Examples

```text title="Avoid"
com.shop.billing.issue-refund.v1
{
  "orderId": "ord-7",
  "amount": "12.00"
}
```

```text title="Prefer"
com.shop.billing.issue-refund.v1
{
  "orderId": "ord-7",
  "amount": "12.00",
  "actor": { "userId": "usr-31", "tenantId": "ten-4" }
}
```

### consumer-acts-within-its-messages-identity → tenant-data-scoped-to-the-callers-tenant · MUST

Where the program serves several tenants, every message consumer scopes every read and write by the tenant its message carries. It never scopes them by the wider reach of its own service identity.

#### Why

The message consumer's own identity can reach every tenant, so a read or a write scoped by it alone reaches tenants the person who caused the work never belonged to — least privilege.

#### Examples

```pseudo title="Avoid"
function onIssueRefund(message, context)
  let invoice = invoices.findByOrder(message.orderId, serviceIdentity)
  ...
```

```pseudo title="Prefer"
function onIssueRefund(message, context)
  let invoice = invoices.findByOrder(message.actor.tenantId, message.orderId, context)
  ...
```

### consumer-checks-access-by-its-messages-identity → operation-access-checked-on-every-call · MUST

Every message consumer checks access by the identity its message carries. It never acts by the wider rights of its own service identity alone.

#### Why

The message consumer's own identity holds every right its work may need, so a check made by it alone passes work the person who caused it had no right to — least privilege.

#### Examples

```pseudo title="Avoid"
function onIssueRefund(message, context)
  call access.require(serviceIdentity, "orders.refund", message.orderId)
  ...
```

```pseudo title="Prefer"
function onIssueRefund(message, context)
  call access.require(message.actor, "orders.refund", message.orderId)
  ...
```
