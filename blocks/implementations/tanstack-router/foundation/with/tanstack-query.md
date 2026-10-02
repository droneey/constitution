# TanStack Router with TanStack Query

> Screens whose reads suspend into the route's pending and error components.

## reads-suspend-into-the-route · MAY
A screen's read may suspend — `useSuspenseQuery` — when its route declares the pending and error components that catch it.

| Why | Check | Tags |
|---|---|---|
| the route then shows its own pending and error states, and the screen renders only data it has. | review | [] |

## error-retry-resets-the-failed-read → error-component-per-route
A route's error component retries by resetting the failed reads and invalidating the router, never by rendering again alone.

| Why | Check | Tags |
|---|---|---|
| rendering again replays the cached failure; only a reset read is fetched again. | review | [] |
