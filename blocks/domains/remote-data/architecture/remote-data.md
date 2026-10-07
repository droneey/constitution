# Remote data

### server-owns-remote-data → fact-has-one-source · MUST
The remote system owns its data: it lives only in the cache of remote data, is never copied into state, a context or a store, and the program never becomes a second source of it.

| Why | Tags |
|---|---|
| a copy of remote data in a store goes stale the moment the server changes it, and the program then acts on the copy. | [] |

### cache-keys-from-feature-factory → fact-has-one-source · MUST
Each feature owns one key factory, and every cache key is built through it from the port's parameters, never by hand.

| Why | Tags |
|---|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh. | [] |

### invalidation-stays-in-its-feature → feature-never-imports-a-feature · MUST
A write invalidates only its own feature's keys. A refresh across features is coordinated by the composing layer, which calls the refresh operation each feature's surface offers, or left to staleness.

| Why | Tags |
|---|---|
| a feature that invalidates another's keys knows that feature, which the laws forbid. | [data] |

### no-second-model-of-remote-data · MUST
Whoever decides whether a change is valid owns the data. Where another system decides, the program keeps no model of its own that guards that data's consistency, and no domain events, event sourcing or specifications for it; what the program decides itself — a draft, an optimistic item, the folding of a stream, a grouping by period — it models in its domain.

| Why | Tags |
|---|---|
| a second model of someone else's data duplicates their rules, and disagrees with them the first time they change. | [data] |
