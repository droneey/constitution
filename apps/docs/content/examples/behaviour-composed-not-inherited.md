```pseudo title="Avoid"
class AuditedOrderStore
  extends OrderStore
  let log: AuditLog

  override function save(order)
    log.write(order.id)
    super.save(order)
```

```pseudo title="Prefer"
class AuditedOrderStore
  let store: OrderStore
  let log: AuditLog

  function save(order)
    log.write(order.id)
    store.save(order)
```
