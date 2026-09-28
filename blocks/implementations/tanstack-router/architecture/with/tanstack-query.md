# TanStack Router with TanStack Query

> Routes that load server data through the query cache.

## loaders-read-through-the-query-cache · MUST
Loaders and guards read through the query cache — `ensureQueryData` with the feature's key factory — and the router's own cache is off (`defaultPreloadStaleTime: 0`).
**Why:** one cache holds the server's data; a second one in the router shows stale copies.
**Check:** review
**Tags:** data
**Implements:** `one-home-per-datum`

## query-client-through-router-context · MUST
The query client reaches loaders and guards through the router's context, never by importing `root/`.
**Why:** routes then depend on what the root hands them, and a spec hands them another client.
**Check:** tool — architecture
**Implements:** `root-imported-only-by-entry-and-delivery-wiring`
