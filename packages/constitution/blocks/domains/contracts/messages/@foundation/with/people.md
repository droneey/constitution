# People

> Governs the personal data a message carries and how long a message broker keeps it.

## Content

### message-carries-only-needed-personal-data → personal-data-collected-only-for-its-purpose · MUST

Every message carries only the personal data its message consumers need. They reach the rest by an identifier.

#### Why

Every message consumer, dead letter and replay holds a copy of what a message carries, so a field no message consumer needs spreads the data to places that never needed it — data minimisation.

#### Examples

```text title="Avoid"
com.shop.orders.order-paid.v1
{
  "orderId": "ord-7",
  "customerId": "cus-1",
  "customerName": "Ann Lee",
  "customerEmail": "ann@example.com",
  "deliveryAddress": "12 Lypova St, Lviv",
  "amount": "48.00"
}
```

```text title="Prefer"
com.shop.orders.order-paid.v1
{
  "orderId": "ord-7",
  "customerId": "cus-1",
  "amount": "48.00"
}
```

## Retention

### broker-keeps-personal-data-no-longer-than-its-retention → personal-data-kept-no-longer-than-its-retention · MUST

Every message broker keeps the personal data its messages carry no longer than its retention, its dead letters and its replays included. Those dead letters include the program's own events it holds for its operator.

#### Why

A message broker's log, a dead letter and a replay are copies of the data, and a copy kept past its retention, a dead letter of the program's own event its operator never reached among them, is data the person was told was gone.

#### Examples

```text title="Avoid"
orders.order-paid        retention: forever
orders.dead-letters      retention: forever
replay archive           retention: forever
```

```text title="Prefer"
orders.order-paid        retention: 7 days
orders.dead-letters      retention: 30 days
replay archive           retention: 30 days
```
