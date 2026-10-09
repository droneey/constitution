# Testing Library with remote data

> Specs of screens that read and change data another system owns.

### spec-cache-client-fresh-without-retries → case-independent-of-order · MUST
Each spec builds its own cache client, with its retries off, and no client is shared between specs.

| Why | Tags |
|---|---|
| nothing leaks from one spec's cache into the next, and a failed answer fails the case at once instead of being retried. | [] |
