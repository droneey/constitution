# Cache

> Governs who owns remote data in the tree: its cache, keys and refreshes, the library that caches it, and where a stream is folded.

## Ownership

### remote-data-lives-only-in-its-cache → fact-has-one-source · MUST

Data another system owns, which the program reads to show or act on, lives only in its cache: it is never copied into state the program keeps elsewhere, save a replica the program declares with its source and its refresh.

| Why |
|---|
| a copy goes stale the moment the remote system changes the data, and the program then acts on the copy. |

### remote-data-has-no-second-model · MUST

Data another system owns has no second model in the program: the program keeps no aggregate, domain event or specification guarding that data's consistency; what it decides itself — a draft, an optimistic item — it models in its domain.

| Why |
|---|
| a second model of someone else's data duplicates their rules, and disagrees with them the first time they change. |

## Library

### query-library-home-is-the-binding-units → layer-imports-dependencies-by-its-role · MUST

The query library — the library that caches remote data and runs its reads and writes — has its home in the binding units in the presentation of features and of composition modules, and `root/`, which builds the client; no other folder imports it — no component, adapter or code of `libs/`.

| Why |
|---|
| caching belongs to the binding units: a component that queries can no longer be shown with plain data, an adapter that caches holds a second cache, and a library that caches takes the application's data into code every program shares. |

### query-library-decides-when-never-what → use-case-leaves-decisions-to-the-model · MUST

The query library decides when and how often an operation's use case runs — its cache, retries, pauses, deduplication and persistence — and never what the use case decides; a mutation's callbacks only predict its outcome and undo the prediction, through the model's own functions. Where the business defines what happens without a connection, the use case decides it and the library does not pause it.

| Why |
|---|
| a rule hidden in the library's configuration or callbacks never reaches the model, and a pause the library takes before the use case runs silently skips the offline path the use case holds. |

## Keys and refreshes

### cache-key-built-by-its-features-factory → fact-has-one-source · MUST

A cache key is built only by the one key factory of the feature or the module of composition that owns its operation, from the operation's parameters, never written by hand.

| Why |
|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh. |

### write-invalidates-only-its-features-keys → feature-never-imports-a-feature · MUST

A write invalidates only its own feature's keys; a refresh across features is made by the composing layer, through the refresh operation each feature's surface offers, or left to staleness.

| Why |
|---|
| a feature that invalidates another's keys knows that feature, which the layers forbid. |

## Streams

### stream-folded-in-the-domain · SHOULD

A stream of events that builds an entity is folded by a pure function of the domain before the result reaches the cache.

| Why |
|---|
| the fold is tested without a network, and the transport can change without touching it. |
