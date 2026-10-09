# Remote data

> Governs who owns remote data in the tree: its cache, keys and refreshes.

## Ownership

### remote-data-lives-only-in-its-cache → fact-has-one-source · MUST
Data another system owns, which the program reads to show or act on, lives only in its cache: it is never copied into state the program keeps elsewhere, save a replica the program declares with its source and its refresh.

| Why | Tags |
|---|---|
| a copy goes stale the moment the remote system changes the data, and the program then acts on the copy. | [data] |

### remote-data-has-no-second-model · MUST
Data another system owns has no second model in the program: the program keeps no aggregate, domain event or specification guarding that data's consistency; what it decides itself — a draft, an optimistic item, the folding of a stream — it models in its domain.

| Why | Tags |
|---|---|
| a second model of someone else's data duplicates their rules, and disagrees with them the first time they change. | [data] |

## Keys and refreshes

### cache-key-built-by-its-features-factory → fact-has-one-source · MUST
A cache key is built only by its feature's one key factory, from the port's parameters, never written by hand.

| Why | Tags |
|---|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh. | [data] |

### write-invalidates-only-its-features-keys → feature-never-imports-a-feature · MUST
A write invalidates only its own feature's keys; a refresh across features is made by the composing layer, through the refresh operation each feature's surface offers, or left to staleness.

| Why | Tags |
|---|---|
| a feature that invalidates another's keys knows that feature, which the layers forbid. | [data] |

## Streams

### stream-folded-in-the-domain · SHOULD
A stream of events that builds an entity is folded by a pure function of the domain before the result reaches the cache.

| Why | Tags |
|---|---|
| the fold is tested without a network, and the transport can change without touching it. | [data] |
