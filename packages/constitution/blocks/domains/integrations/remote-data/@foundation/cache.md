# Cache

> Governs where remote data lives, a read of it, the invalidation a write makes, where their failures go and the remote-data cache that holds it, in the program and in its specs.

## Vocabulary

**Remote data** is data another system owns and decides on, which the program reads to show or act on and changes only through that system.

The **remote-data cache** is the program's store of the remote data it has read, each entry under the key of the read that fetched it.

## Copies

### remote-data-lives-only-in-its-cache → fact-has-one-source · MUST

Every piece of remote data lives in the program only in its remote-data cache, never copied into state the program keeps elsewhere. Exempt: a replica the program declares with its source and its refresh, and an identifier or a follow-up a remote system minted for what the program's own command started, which the program keeps as its own record.

#### Why

A copy goes stale the moment the remote system changes the data, and the program then acts on the copy — a single source of truth.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart
function showCart(cartId, { cache, getCart })
  let cart = await cache.read(cartKeys.detail(cartId), function(context)
    getCart({ cartId }, context))

  cartStore.set(cart)  # a second copy, stale once the server changes it
```

```pseudo title="Prefer"
# carts/presentation/bindings/queries/show-cart
function showCart(cartId, { cache, getCart })
  return cache.read(cartKeys.detail(cartId), function(context)
    getCart({ cartId }, context))
```

## Reads

### read-superseded-for-its-key-is-cancelled → outside-call-can-be-cancelled · MUST

Every read superseded for its key is cancelled, so only the latest answer reaches the remote-data cache. A read is superseded by one that replaces what is cached for its key, such as a refetch after a write or an invalidation.

#### Why

An answer that arrives late otherwise overwrites a newer one, and the program shows data it no longer asked for.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/commands/rename-cart
function onRenameCart(input, { cache, renameCart }, context)
  await renameCart(input, context)

  cache.invalidate(cartKeys.all)  # an older read still in flight may land after the refetch
```

```pseudo title="Prefer"
# carts/presentation/bindings/commands/rename-cart
function onRenameCart(input, { cache, renameCart }, context)
  await cache.cancel(cartKeys.all)
  await renameCart(input, context)

  cache.invalidate(cartKeys.all)
```

### cache-shares-one-read-per-key · SHOULD

All reads of one key share one request and one entry of the remote-data cache.

#### Why

Two readers of one key that each fetch it make two requests and may show two answers.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart-badge
let cart = await getCart({ cartId }, context)

# carts/presentation/bindings/queries/show-cart-summary
let cart = await getCart({ cartId }, context)
```

```pseudo title="Prefer"
# carts/presentation/bindings/queries/show-cart-badge
let cart = await cache.read(cartKeys.detail(cartId), function(context) getCart({ cartId }, context))

# carts/presentation/bindings/queries/show-cart-summary
let cart = await cache.read(cartKeys.detail(cartId), function(context) getCart({ cartId }, context))
```

### staleness-set-per-key · SHOULD

Every key of the remote-data cache has its own staleness: how long its entry stays fresh and when it is read again.

#### Why

One policy for every key either fetches again data that never changes or shows stale data that changes every second.

#### Examples

```pseudo title="Avoid"
# root/cache
let cache = createCache({ staleAfter: seconds(30) })  # product texts and stock levels alike
```

```pseudo title="Prefer"
# catalogue/presentation/bindings/queries/show-product
cache.read(productKeys.detail(productId), fetchProduct, { staleAfter: hours(1) })

# catalogue/presentation/bindings/queries/show-stock
cache.read(stockKeys.level(productId), fetchStock, { staleAfter: seconds(5) })
```

## Writes

### write-invalidates-its-entries-by-a-shared-name · MUST

Every write invalidates the remote-data cache's entries it affects by a name they share, never key by key. Such a name is a key prefix, a tag or a type.

#### Why

A write that invalidates one exact key at a time must list every entry it touched, and an entry it misses stays stale.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/commands/add-line
function onAddLine(input, { cache, addLine }, context)
  await cache.cancel(cartKeys.all)
  await addLine(input, context)

  cache.invalidate(cartKeys.detail(input.cartId))
  cache.invalidate(cartKeys.total(input.cartId))  # cartKeys.lines missed
```

```pseudo title="Prefer"
# carts/presentation/bindings/commands/add-line
function onAddLine(input, { cache, addLine }, context)
  await cache.cancel(cartKeys.all)
  await addLine(input, context)

  cache.invalidate(cartKeys.all)
```

## Failures

### remote-data-failure-reaches-one-handler · MUST

Every failed read and write of remote data reaches one handler the program registers on its remote-data cache.

#### Why

A failure any read or write can meet, such as an ended session, is otherwise handled at each read and write, each its own way, and missed at one of them.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart
try
  return await cache.read(cartKeys.detail(cartId), fetchCart)
catch UnauthenticatedError
  goToSignIn()

# orders/presentation/bindings/queries/show-orders
return cache.read(orderKeys.list(), fetchOrders)  # an ended session missed here
```

```pseudo title="Prefer"
# root/cache
let cache = createCache({ onFailure: handleRemoteFailure })

# carts/presentation/bindings/queries/show-cart
return cache.read(cartKeys.detail(cartId), fetchCart)
```

## Specs

### spec-builds-a-cache-of-its-own → case-independent-of-order · SHOULD

Every spec that uses a remote-data cache builds one of its own, and no remote-data cache is shared between specs.

#### Why

A remote-data cache shared between specs carries one spec's data into the next, which then passes or fails by their order.

#### Examples

```pseudo title="Avoid"
# carts/presentation/__tests__/show-cart.test
let cache = createTestCache()  # shared by every case below

test "should show the cart's lines"
  ...
```

```pseudo title="Prefer"
# carts/presentation/__tests__/show-cart.test
test "should show the cart's lines"
  # Arrange
  let cache = createTestCache()
  ...
```

### spec-cache-retries-nothing · SHOULD

Every remote-data cache a spec builds has its retries off.

#### Why

A failed answer retried hides behind the retries' delay instead of failing the case at once, so a spec of a failure passes slowly or times out for a reason it does not name.

#### Examples

```pseudo title="Avoid"
# __tests__/support/test-cache
function createTestCache()
  return createCache()  # retries three times with backoff
```

```pseudo title="Prefer"
# __tests__/support/test-cache
function createTestCache()
  return createCache({ retries: 0 })
```
