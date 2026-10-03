# TanStack Router with TanStack Query

> Routes that load server data through the query cache.

## loaders-read-through-the-query-cache → one-home-per-datum
Loaders and guards read through the query cache — `ensureQueryData` with the feature's key factory — and the router's own cache is off (`defaultPreloadStaleTime: 0`).

| Why | Check | Tags |
|---|---|---|
| one cache holds the server's data; a second one in the router shows stale copies. | review | [] |

## query-client-through-router-context → root-imported-only-by-entry-and-delivery-wiring
The query client travels in the router's context with the adapters; no route imports it from `root/`.

| Why | Check | Tags |
|---|---|---|
| routes then depend on what the root hands them, and a spec hands them another client. | review | [] |
