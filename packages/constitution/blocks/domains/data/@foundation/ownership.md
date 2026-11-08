# Ownership

> Governs what programs that own their data apart may share.

## General

### programs-owning-their-data-share-no-business-rule → fact-has-one-source · MUST

No two programs that own their data apart share a rule of the business. Neither a library both import nor any other code both run holds one for them.

#### Why

A business rule two services share ties their releases together, and a change to it must reach the data each of them owns at once, so they become one program deployed in pieces with its data split between them.

#### Examples

```pseudo title="Avoid"
# packages/pricing-rules/discount  # imported by orders-service and invoices-service
function discountCentsFor(totalCents)
  if totalCents < discountThresholdCents then
    return 0

  return percentOf(totalCents, discountPercent)
```

```pseudo title="Prefer"
# orders-service/orders/domain/order/services/discount.service
function discountCentsFor(totalCents)
  if totalCents < discountThresholdCents then
    return 0

  return percentOf(totalCents, discountPercent)

# invoices-service/invoices/presentation/consumers/on-order-placed
function onOrderPlaced(event: OrderPlaced, issueInvoice, context)
  await issueInvoice({ orderId: event.orderId, amountCents: event.payableCents }, context)
```
