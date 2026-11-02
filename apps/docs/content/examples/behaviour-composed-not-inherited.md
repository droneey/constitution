```pseudo title="Avoid"
class AuditedOrderRepository
  extends OrderRepository
  let log: AuditLog

  override function save(order)
    log.write(order.id)
    super.save(order)
```

```pseudo title="Prefer"
class AuditedOrderRepository
  let store: OrderRepository
  let log: AuditLog

  function save(order)
    log.write(order.id)
    store.save(order)
```
