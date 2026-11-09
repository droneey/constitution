# Collections

> Governs how a collection is paged, ordered, filtered and batched.

## Paging

### list-answer-paged-with-a-maximum → outside-read-bounded · MUST

Every list answer is paged, never longer than a maximum page size its caller cannot raise. A page asked for beyond the maximum is cut to it or refused, and one asked for with no size gets a default size no larger.

#### Why

One request for every row otherwise exhausts the program's memory and its store for every other caller.

#### Examples

```pseudo title="Avoid"
function listOrders(request, context)
  return orderQueries.list(request.filter, {
    limit: request.pageSize,
  }, context)
```

```pseudo title="Prefer"
let defaultPageSize = 50
let maxPageSize = 200

function listOrders(request, context)
  return orderQueries.list(request.filter, {
    limit: min(request.pageSize ?? defaultPageSize, maxPageSize),
  }, context)
```

### list-paged-by-an-opaque-cursor · MUST

Every list is paged by an opaque cursor, never by an offset. The server issues a cursor with each page but the last, and its caller reads nothing from the cursor's form.

#### Why

An offset skips or repeats rows added between pages and grows slower with depth, and an opaque cursor can change its form without breaking callers.

#### Examples

```pseudo title="Avoid"
function listOrders(request, context)
  let items = orderQueries.list({
    offset: request.offset,
    limit: pageSize,
  }, context)

  return { items }
```

```pseudo title="Prefer"
function listOrders(request, context)
  let after = if request.cursor then decodeCursor(request.cursor) else <absent>
  let rows = orderQueries.listAfter(after, pageSize + 1, context)
  let items = rows.take(pageSize)

  return {
    items,
    nextCursor: if rows.length > pageSize then encodeCursor(items.last) else <absent>,
  }
```

### paged-order-ends-on-a-unique-key · MUST

Every order a list is paged over ends on a unique key, so that no two of its items tie.

#### Why

An order with ties returns tied rows in another order on each page, so a cursor taken at a tie skips some of them and repeats others.

#### Examples

```pseudo title="Avoid"
let ordersPageOrder = [
  { field: "placedAt", direction: "descending" },
]
```

```pseudo title="Prefer"
let ordersPageOrder = [
  { field: "placedAt", direction: "descending" },
  { field: "id", direction: "descending" },
]
```

### cursor-accepted-only-with-the-query-it-was-issued-for · MUST

Every cursor is accepted back only with the filter and the order it was issued for. One sent with another filter or order is refused.

#### Why

A cursor read against another filter or order points into a list it was never a position of, so its page silently skips or repeats items.

#### Examples

```pseudo title="Avoid"
function readCursor(request)
  return decodeCursor(request.cursor).position
```

```pseudo title="Prefer"
function readCursor(request)
  let cursor = decodeCursor(request.cursor)

  if cursor.queryHash is not hash(request.filter, request.sort) then
    throw new CursorQueryMismatchError()

  return cursor.position
```

## Filters and sorting

### list-filtered-only-by-declared-fields · MUST

Every list is filtered only by the fields its operation declares for filtering. A request that filters by another field is refused.

#### Why

A filter on a hidden field tells its caller, by the rows it returns, what that field holds, and one on a field the store has no index for is a full scan.

#### Examples

```pseudo title="Avoid"
function listOrders(request, context)
  return orderQueries.list({ where: request.filter }, context)  # filter[riskScore]=90 reveals flagged orders
```

```pseudo title="Prefer"
let listOrdersFilter = closed {
  status: optional OrderStatus,
  placedAfter: optional Instant,
}

function listOrders(request, context)
  let filter = listOrdersFilter.parse(request.filter)

  return orderQueries.list({ where: filter }, context)
```

### list-sorted-only-by-declared-fields · MUST

Every list is sorted only by the fields its operation declares for sorting. A request that sorts by another field is refused.

#### Why

A sort by any field is both an oracle on hidden fields and a full scan the store has no index for.

#### Examples

```pseudo title="Avoid"
function listOrders(request, context)
  return orderQueries.list({ sortBy: request.sort }, context)
```

```pseudo title="Prefer"
let listOrdersSort = oneOf("placedAt", "total")

function listOrders(request, context)
  let sort = listOrdersSort.parse(request.sort)

  return orderQueries.list({ sortBy: sort }, context)
```

## Batches

### batch-declares-whether-it-is-atomic · SHOULD

Every batch operation declares in its contract whether it is atomic, succeeding or failing whole.

#### Why

A caller that cannot tell an atomic batch from one that is not retries a failed atomic batch item by item, or takes a half-applied one for undone.

#### Examples

```text title="Avoid"
operation cancelOrders
  input:   { orderIds: OrderId[] }
  answer:  { cancelled: OrderId[] }
```

```text title="Prefer"
operation cancelOrders
  atomic:  yes, every order is cancelled or none is
  input:   { orderIds: OrderId[] }
  answer:  { cancelled: OrderId[] }
```

### non-atomic-batch-answers-each-item · SHOULD

Every batch operation that is not atomic answers the outcome of each item, in the order of the request. That outcome is the item's result or its problem.

#### Why

A caller of a half-applied batch otherwise cannot tell which items to retry.

#### Examples

```text title="Avoid"
importProducts answer
{ "imported": 2, "failed": 1 }
```

```text title="Prefer"
importProducts answer
{
  "items": [
    { "result": { "productId": "prd-1" } },
    { "problem": { "code": "product.sku-taken", "sku": "MUG-12" } },
    { "result": { "productId": "prd-3" } }
  ]
}
```
