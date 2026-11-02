# Collections

> Governs how a collection is paged, ordered, filtered and batched.

## Paging

### list-answer-paged-with-a-maximum → growing-collection-bounded · MUST

A list answer is paged, with a maximum page size the caller cannot raise. It has a default page size, and a larger page asked for is cut to the maximum or refused.

| Why |
|---|
| one request for every row otherwise exhausts the program's memory and its store for every other caller. |

### list-paged-by-an-opaque-cursor · MUST

A list is paged by an opaque cursor. The cursor runs over an order whose last key is unique; the server issues one with each page and accepts it back only with the filter and the order it was issued for, and the last page carries none.

| Why |
|---|
| an offset skips or repeats rows added between pages and grows slower with depth, an order with ties returns tied rows in another order on each page, and an opaque cursor can change its form without breaking callers. |

## Filters

### list-filtered-and-sorted-only-by-declared-fields · MUST

A list is filtered and sorted only by the fields its operation declares for it, and a request naming another field is refused.

| Why |
|---|
| a sort by any field is both an oracle on hidden fields and a full scan the store has no index for. |

## Batches

### batch-declares-atomic-or-answers-each-item · SHOULD

A batch operation declares whether it is atomic, and one that is not answers each item's outcome. An atomic one succeeds or fails whole, and any other answers the outcome of each item — its result or its problem — in the order of the request.

| Why |
|---|
| a caller of a half-applied batch otherwise cannot tell which items to retry. |
