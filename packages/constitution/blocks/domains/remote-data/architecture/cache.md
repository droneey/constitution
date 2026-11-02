# Cache

> Governs who owns remote data in the tree: its cache, keys and refreshes, the library that caches it, and where a stream is folded.

## Ownership

### remote-data-lives-only-in-its-cache → fact-has-one-source · MUST

Remote data lives only in its cache. Data another system owns, which the program reads to show or act on, is never copied into state the program keeps elsewhere, save a replica the program declares with its source and its refresh.

| Why |
|---|
| a copy goes stale the moment the remote system changes the data, and the program then acts on the copy — a single source of truth. |

### remote-data-has-no-second-domain-model · MUST

Remote data has no second domain model in the program. The program keeps no aggregate or domain event guarding the consistency of data another system owns; what it decides itself — a draft, an optimistic item — it models in its domain.

| Why |
|---|
| a second domain model of someone else's data duplicates their rules, and disagrees with them the first time they change. |

### outside-identifier-cached-under-the-callers → command-returns-nothing · MUST

Where the program stores no aggregate for what a command starts, it keeps what an outside system minted for that command in its remote-data cache, under the identifier the command's caller made. That is the outside identifier and the follow-up the port to that system reported, such as the address of a payment page, and the command's query reads them there by the caller's identifier.

| Why |
|---|
| a command that returned what the outside system minted would be half a query, and one that kept it nowhere loses it with the answer to its first attempt, so the caller can neither retry safely nor find what it started — command–query separation. |

## Library

### query-library-home-is-the-binding-units → layer-imports-dependencies-by-its-role · MUST

The query library's home is the binding units. The library that caches remote data and runs its reads and writes is imported only by the binding units in the presentation of features, of composition modules and of the program, and by `root/`, which builds its client — never by a component, an adapter or code of `libs/`.

| Why |
|---|
| a component that queries can no longer be shown with plain data, an adapter that caches holds a second cache, and a library that caches takes the program's data into code every program shares. |

### query-library-decides-when-never-what → use-case-leaves-decisions-to-the-domain-model · MUST

The query library decides when a use case runs, never what it decides. It decides when and how often an operation's use case runs — its cache, retries, pauses, deduplication and persistence; a write's callbacks only predict its outcome and undo the prediction, through the domain model's pure functions — a checked constructor or a derived value that computes the predicted value — never a transition, which only a use case calls. Where the business defines what happens without a connection, the use case decides it and the library does not pause it.

| Why |
|---|
| a rule hidden in the library's configuration or callbacks never reaches the domain model, and a pause the library takes before the use case runs silently skips the offline path the use case holds. |

## Keys and refreshes

### cache-key-built-by-its-owners-factory → fact-has-one-source · MUST

A cache key is built only by its owner's one key factory. The owner is the feature or the composition module that owns the key's operation, and its factory builds the key from the operation's parameters; no key is written by hand.

| Why |
|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh — a single source of truth. |

### write-invalidates-only-its-features-keys → code-placed-by-its-reason-to-change · MUST

A write's binding unit invalidates what the write changed, and only its own feature's keys. It names them through its feature's key factory; a refresh across features is made by the composing layer, through the refresh operation each feature's surface offers, or left to staleness.

| Why |
|---|
| an invalidation made away from the write that knows what it changed reloads too much or misses what changed, so the program shows stale data, and a feature that invalidates another's keys knows that feature's keys, so it breaks whenever they change, through a coupling no import rule sees. |

## Streams

### stream-folded-in-the-domain · MUST

A stream of events that builds an entity is folded by a pure function of the domain before the result reaches the cache.

| Why |
|---|
| a fold written into the transport or the cache is proven only over a network, and changes with every change of the transport. |
