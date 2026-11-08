# Invalidation

> Governs when a write refreshes the cache.

## General

### invalidation-in-on-settled → write-invalidates-what-it-changed · MUST

Every write invalidates its keys in `onSettled`.

| Why |
|---|
| `onSettled` runs after success and failure alike, so the cache is refreshed even after a write that failed on the client but landed on the server. |
