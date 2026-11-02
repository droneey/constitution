```pseudo title="Avoid"
# orders/infrastructure/postgres/order-repository.adapter
catch error
  log(error)
  throw error

# orders/application/use-cases/commands/place-order
catch error
  log(error)
  throw error
# the error filter logs it a third time
```

```pseudo title="Prefer"
# orders/infrastructure/postgres/order-repository.adapter
# orders/application/use-cases/commands/place-order
# no catch: the failure passes

# presentation/bindings/error-filter
catch error
  log(error)

  return errorAnswer(error)
```
