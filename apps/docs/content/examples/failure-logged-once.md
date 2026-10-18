```pseudo title="Avoid"
# orders/order-repository.ts
catch error
  log(error)
  throw error

# orders/order-service.ts
catch error
  log(error)
  throw error
# the handler logs it a third time
```

```pseudo title="Prefer"
# orders/order-repository.ts
# orders/order-service.ts
# no catch: the failure passes

# api/order-handler.ts
catch error
  log(error)
  return errorAnswer(error)
```
