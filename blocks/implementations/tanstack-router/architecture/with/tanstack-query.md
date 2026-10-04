# TanStack Router with TanStack Query

> Routes that load server data through the query cache.

## loaders-read-through-the-query-cache → one-home-per-datum
Loaders and guards read through the query cache — the read's `queryOptions` through the query client — and the router's own cache is off (`defaultPreloadStaleTime: 0`).

| Why | Check | Tags |
|---|---|---|
| one cache holds the server's data; a second one in the router shows stale copies. | review | [] |

