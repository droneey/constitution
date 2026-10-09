# Collections

> Governs how a collection is paged, ordered, filtered and batched.

## Paging

### list-answer-paged-with-a-maximum → outside-read-bounded · MUST
A list answer is paged, with a default page size and a maximum the caller cannot raise; a larger page asked for is cut to the maximum or refused.

| Why | Tags |
|---|---|
| one request for every row otherwise exhausts the program's memory and its store for every other caller. | [performance, security] |

### list-paged-by-an-opaque-cursor · MUST
A list is paged by an opaque cursor the server issues with each page and accepts back only with the filter and the order it was issued for; the last page carries none.

| Why | Tags |
|---|---|
| an offset skips or repeats rows added between pages and grows slower with depth, and an opaque cursor can change its form without breaking callers. | [performance] |

### list-ordered-by-a-unique-key · MUST
A paged list is ordered by a key whose last field is unique, so that no row falls on two pages or on none.

| Why | Tags |
|---|---|
| an order with ties lets the store return tied rows in another order on each page. | [data] |

## Filters

### list-filtered-and-sorted-only-by-declared-fields · SHOULD
A list is filtered and sorted only by the fields its operation declares for it, and a request naming another field is refused.

| Why | Tags |
|---|---|
| a sort by any field is both an oracle on hidden fields and a full scan the store has no index for. | [security, performance] |

## Batches

### batch-declares-atomic-or-answers-each-item · SHOULD
A batch operation declares whether it is atomic: an atomic one succeeds or fails whole, and any other answers the outcome of each item — its result or its problem — in the order of the request.

| Why | Tags |
|---|---|
| a caller of a half-applied batch otherwise cannot tell which items to retry. | [data] |
