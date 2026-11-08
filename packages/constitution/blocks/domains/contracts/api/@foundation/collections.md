# Collections

> Governs how a collection is paged, ordered, filtered and batched.

## Paging

### list-answer-paged-with-a-maximum → outside-read-bounded · MUST

Every list answer is paged, never longer than a maximum page size its caller cannot raise. A page asked for beyond the maximum is cut to it or refused, and one asked for with no size gets a default size no larger.

| Why |
|---|
| one request for every row otherwise exhausts the program's memory and its store for every other caller. |

### list-paged-by-an-opaque-cursor · MUST

Every list is paged by an opaque cursor, never by an offset. The server issues a cursor with each page but the last, and its caller reads nothing from the cursor's form.

| Why |
|---|
| an offset skips or repeats rows added between pages and grows slower with depth, and an opaque cursor can change its form without breaking callers. |

### paged-order-ends-on-a-unique-key · MUST

Every order a list is paged over ends on a unique key, so that no two of its items tie.

| Why |
|---|
| an order with ties returns tied rows in another order on each page, so a cursor taken at a tie skips some of them and repeats others. |

### cursor-accepted-only-with-the-query-it-was-issued-for · MUST

Every cursor is accepted back only with the filter and the order it was issued for. One sent with another filter or order is refused.

| Why |
|---|
| a cursor read against another filter or order points into a list it was never a position of, so its page silently skips or repeats items. |

## Filters and sorting

### list-filtered-only-by-declared-fields · MUST

Every list is filtered only by the fields its operation declares for filtering. A request that filters by another field is refused.

| Why |
|---|
| a filter on a hidden field tells its caller, by the rows it returns, what that field holds, and one on a field the store has no index for is a full scan. |

### list-sorted-only-by-declared-fields · MUST

Every list is sorted only by the fields its operation declares for sorting. A request that sorts by another field is refused.

| Why |
|---|
| a sort by any field is both an oracle on hidden fields and a full scan the store has no index for. |

## Batches

### batch-declares-whether-it-is-atomic · SHOULD

Every batch operation declares in its contract whether it is atomic, succeeding or failing whole.

| Why |
|---|
| a caller that cannot tell an atomic batch from one that is not retries a failed atomic batch item by item, or takes a half-applied one for undone. |

### non-atomic-batch-answers-each-item · SHOULD

Every batch operation that is not atomic answers the outcome of each item, in the order of the request. That outcome is the item's result or its problem.

| Why |
|---|
| a caller of a half-applied batch otherwise cannot tell which items to retry. |
