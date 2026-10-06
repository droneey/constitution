# TanStack Router with TanStack Query

> Routes that load server data through the query cache, and screens whose reads suspend into the route's pending and error components.

## loaders-read-through-the-query-cache → one-home-per-datum
Loaders and guards read through the query cache — the read's `queryOptions` through the query client — and the router's own cache is off (`defaultPreloadStaleTime: 0`).

| Why | Check | Tags |
|---|---|---|
| one cache holds the server's data; a second one in the router shows stale copies. | review | [] |

## reads-suspend-into-the-route · MAY
A screen's read may suspend — `useSuspenseQuery` — when its route declares the pending and error components that catch it.

| Why | Check | Tags |
|---|---|---|
| the route then shows its own pending and error states, and the screen renders only data it has. | review | [] |

## error-retry-resets-the-failed-read · SHOULD
A route's error component retries by resetting the failed reads and invalidating the router, never by rendering again alone.

| Why | Check | Tags |
|---|---|---|
| rendering again replays the cached failure; only a reset read is fetched again. | review | [] |
