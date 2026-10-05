# Remote data

## server-owns-remote-data → one-home-per-datum
The remote system owns its data: it lives only in the cache of remote data, is never copied into a store, and the program never becomes a second source of it.

| Why | Check | Tags |
|---|---|---|
| a copy of remote data in a store goes stale the moment the server changes it, and the screen shows the copy. | review | [] |

## cache-keys-from-feature-factory → one-home-per-datum
Each feature owns one key factory, and every cache key is built through it from the port's parameters, never by hand.

| Why | Check | Tags |
|---|---|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh. | review | [] |

## invalidation-stays-in-its-feature → features-blind-to-each-other
A write invalidates only its own feature's keys. A refresh across features is coordinated by the composing layer, which calls the refresh operation each feature's surface offers, or left to staleness.

| Why | Check | Tags |
|---|---|---|
| a feature that invalidates another's keys knows that feature, which the laws forbid. | review | [data] |

## no-second-model-of-remote-data · SHOULD
Whoever decides whether a change is valid owns the data. Where another system decides, the program keeps no model of its own that guards that data's consistency, and no domain events, event sourcing or specifications for it; what the program decides itself — a draft, an optimistic item, the folding of a stream, a grouping by period — it models in its domain.

| Why | Check | Tags |
|---|---|---|
| a second model of someone else's data duplicates their rules, and disagrees with them the first time they change. | review | [] |

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain before they reach the cache.

| Why | Check | Tags |
|---|---|---|
| the fold is tested without a network, and the transport can change without touching it. | review | [data] |

## unauthorized-acted-on-once-by-the-cache → transport-failures-mapped-once
The unauthorized error the shared mapper returns is acted on afterwards, once, by the cache's global error handler.

| Why | Check | Tags |
|---|---|---|
| every read and write can meet that failure, so it is handled in one place for all of them, and no adapter handles it on its own. | review | [] |
