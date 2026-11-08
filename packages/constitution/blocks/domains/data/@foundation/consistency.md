# Consistency

> Governs concurrent changes to the stored data, the invariants the store holds and what a read sees of its caller's own writes.

## Vocabulary

A write meets a **write conflict** when what the store holds stands against it, such as a version moved on since the data it decides on was read, or an identifier or a unique value already stored.

## Concurrent changes

### data-a-write-decides-on-carries-its-version → write-on-read-data-is-conditional · MUST

Every record a write decides on, read by an earlier request, carries a version the store checks within that write. The write is an update or a compare-and-set conditional on the version read, or, for a create, one the store's uniqueness of its identifier refuses; it is never a read of the version followed by a later write.

#### Why

No lock outlives a request, so only a version the data carries shows that what one request read changed before the next request writes, and a version read before the write leaves a gap in which another writer moves it unseen — optimistic concurrency control.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
function writeOrder(tx, order)
  let stored = await tx.find(OrderSchema, order.id)

  if stored.version != order.loadedVersion then
    throw new LostRaceError(order.id)

  await tx.update(OrderSchema, { id: order.id }, toOrderRow(order))  # the version may move between the two
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
function writeOrder(tx, order)
  let changed = await tx.update(OrderSchema,
    { id: order.id, version: order.loadedVersion },
    toOrderRow(order))

  if changed == 0 then
    throw new LostRaceError(order.id)
```

### consistency-set-carries-one-version · MUST

Every set of records the program keeps consistent as one carries one version for the whole set. Every write to any record of the set checks that version and moves it.

#### Why

A version per record of a set kept consistent as one lets two writers change two of its records, each passing its own check, into a state the set forbids — optimistic concurrency control.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
function writeLines(tx, order)
  for line in order.lines
    let changed = await tx.update(OrderLineSchema,
      { orderId: order.id, sku: line.sku, version: line.loadedVersion },
      toOrderLineRow(line))  # each line checked alone, the order's line limit by none

    if changed == 0 then
      throw new LostRaceError(order.id)
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
function writeOrder(tx, order)
  let changed = await tx.update(OrderSchema,
    { id: order.id, version: order.loadedVersion },
    { version: order.version })

  if changed == 0 then
    throw new LostRaceError(order.id)

  await tx.replaceAll(OrderLineSchema, { orderId: order.id }, order.lines.map(toOrderLineRow))
```

### unmatched-conditional-write-fails-as-a-conflict → write-on-read-data-is-conditional · MUST

Every conditional write the store applied to nothing fails as a write conflict, never passing as done. The code that writes recognises it by the store's own answer, such as a count of no record changed or a compare-and-set that found another value.

#### Why

A conditional update that matched nothing raises no failure in most stores, so code that reads no count reports as saved a change the store refused, and the lost update the check was there to stop goes unseen.

#### Examples

```pseudo title="Avoid"
# carts/infrastructure/database/cart-repository.adapter
function writeCart(tx, cart)
  await tx.update(CartSchema,
    { id: cart.id, version: cart.loadedVersion },
    toCartRow(cart))  # matching nothing passes as saved
```

```pseudo title="Prefer"
# carts/infrastructure/database/cart-repository.adapter
function writeCart(tx, cart)
  let changed = await tx.update(CartSchema,
    { id: cart.id, version: cart.loadedVersion },
    toCartRow(cart))

  if changed == 0 then
    throw new LostRaceError(cart.id)
```

## Reads

### read-sees-its-callers-own-writes · MUST

Where a store may lag behind the writes, every later read by a caller sees each write that caller made. It reads from a store that does not lag behind that write, or waits until the version the write saved has reached the store it reads.

#### Why

A read of its caller's own write from a store that lags shows the user a change they just made as not made — read-your-writes consistency.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-queries.adapter
listForCustomer: function(customerId, context)
  return replica.findAll(OrderSchema, { customerId }, { signal: context.signal })  # may not hold the order just placed
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-queries.adapter
listForCustomer: function(customerId, context)
  await replica.waitUntilApplied(context.lastWritePosition, { signal: context.signal })

  return replica.findAll(OrderSchema, { customerId }, { signal: context.signal })
```

## Invariants

### invariant-also-held-by-the-store · MUST

Every invariant over several records that the store can hold is also held by the store. It holds where the transaction that could break it commits, by a constraint of the store where it can express one, such as a uniqueness or a reference, otherwise by a reservation; a check in the code made before the commit only answers earlier.

#### Why

Two concurrent transactions each pass the code's check, each having seen the invariant hold, and store together what it forbids, since only the store sees their writes together.

#### Examples

```pseudo title="Avoid"
# accounts/infrastructure/database/models/user.schema
let UserSchema = table("users", {
  id: text().primaryKey(),
  email: text().notNull()  # unique only by the check before the save
})
```

```pseudo title="Prefer"
# accounts/infrastructure/database/models/user.schema
let UserSchema = table("users", {
  id: text().primaryKey(),
  email: text().notNull().unique()
})
```

### expressible-constraint-declared-in-the-store · MUST

Every single-record invariant the store can express as a constraint is also declared there, beside the check in the code. Such invariants include a required value and a range.

#### Why

A value written past the code's check, by a script, a fix by hand or a second program, lands unrefused where the store could have refused it, and corrupt data is found only when a later read fails on it.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/models/order-line.schema
let OrderLineSchema = table("order_lines", {
  orderId: text().notNull(),
  sku: text(),
  quantity: integer()
})
```

```pseudo title="Prefer"
# orders/infrastructure/database/models/order-line.schema
let OrderLineSchema = table("order_lines", {
  orderId: text().notNull(),
  sku: text().notNull(),
  quantity: integer().notNull().check(atLeast(minimumQuantity))
})
```

### store-constraint-violation-mapped-to-an-expected-failure → dependency-failure-mapped-where-it-is-wrapped · MUST

Every violation of a store's constraint that holds an invariant is mapped to an expected failure of the program's own. The code that writes maps it, never passing it on as a defect.

#### Why

A violation left unmapped reaches the caller as a defect, so a taken name or a missing reference is shown as a crash instead of the failure the caller can act on.

#### Examples

```pseudo title="Avoid"
# accounts/infrastructure/database/user-repository.adapter
function insertUser(tx, user)
  await tx.insert(UserSchema, toUserRow(user))  # a taken email reaches the caller as a defect
```

```pseudo title="Prefer"
# accounts/infrastructure/database/user-repository.adapter
function insertUser(tx, user)
  try
    await tx.insert(UserSchema, toUserRow(user))
  catch UniqueViolation as violation
    throw new LostRaceError(user.id, { cause: violation })
```
