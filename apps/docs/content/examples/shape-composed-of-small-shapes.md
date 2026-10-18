```pseudo title="Avoid"
type OrderSummary = Omit<Order,
  "items" | "notes" | "discounts"
  | "shippingAddress" | "payments">
```

```pseudo title="Prefer"
type Timestamps = {
  createdAt: Instant,
  updatedAt: Instant
}
type OrderSummary = {
  id: OrderId,
  total: Money
} & Timestamps
```
