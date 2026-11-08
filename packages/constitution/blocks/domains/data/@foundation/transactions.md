# Transactions

> Governs what runs inside a transaction of the program's store.

## General

### transaction-holds-no-outside-call → lock-never-held-while-waiting-on-another-system · MUST

No transaction of the program's store is open while the program calls another system. What the change needs from outside is asked before the transaction opens, and what it sets off outside runs after it commits.

#### Why

A call made inside a transaction is not rolled back with it, so a rollback leaves its effect orphaned at the other side, and the transaction holds its locks for as long as the other side takes to answer.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)
    await searchIndex.put(toOrderDocument(order), context)  # another system, inside the transaction
  , { signal: context.signal })
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)
    await tx.insertAll(OutboxSchema, events.map(toOutboxRow))
  , { signal: context.signal })
```
