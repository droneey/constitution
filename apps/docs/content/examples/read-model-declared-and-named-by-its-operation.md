```pseudo title="Avoid"
# presentation/screens/orders-table/orders-table-row
type OrdersTableRow = {
  id: OrderId,
  placedAt: Instant,
  total: Money,
  customerName: PersonName
}

# contracts/order-queries.port
type OrderQueries = {
  list: function(UserId, Page, CallContext): OrdersTableRow[]
}
```

```pseudo title="Prefer"
# contracts/order-queries.port
type OrderListItem = {
  id: OrderId,
  placedAt: Instant,
  total: Money,
  customerName: PersonName
}

type OrderQueries = {
  list: function(UserId, Page, CallContext): OrderListItem[]
}

# use-cases/index, and the feature's surface
export type { OrderListItem }
```
