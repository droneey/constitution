# Cache

> Governs who owns remote data in the tree: its remote-data cache, keys and refreshes, and the library that caches it.

## Vocabulary

The **query library** is the library that caches remote data and runs its reads and writes.

An owner's **key factory** is its one function that builds every cache key of its operations from their parameters.

An **adapter cache** is a remote-data cache that an adapter of a remote system keeps of what that system answers, in a program whose binding units keep no remote-data cache, as a server's adapter does.

## Ownership

### remote-data-has-no-second-domain-model · MUST

No remote data has a second domain model in the program: no aggregate or domain event of the program guards the consistency of data another system owns.

| Why |
|---|
| a second domain model of someone else's data duplicates their rules, and disagrees with them the first time they change. |

### outside-identifier-cached-under-the-callers · MUST

Where the binding units keep the remote-data cache, every outside identifier of a command storing no aggregate is cached under its caller's. That is what the remote system minted for the command and the follow-up its port reported, such as the address of a payment page: the use case hands them to the progress reporter with the caller's identifier, the binding unit writes them into the remote-data cache entry of the command's query under that identifier, and that query reads them there.

| Why |
|---|
| a command that kept what the remote system minted nowhere loses it with the answer to its first attempt, so the caller can neither retry safely nor find what it started — command–query separation. |

## Library

### query-library-home-is-the-binding-units → layer-imports-dependencies-by-its-role · MUST

The query library is imported only by the binding units and by `root/`, which builds its client. The binding units are those in the presentation of features, of composition modules and of the program. Exempt: an adapter cache, whose library only its adapter and `root/` import.

| Why |
|---|
| a unit that queries outside the binding units can no longer be shown or run with plain data, an adapter that caches holds a second remote-data cache, and a library that caches takes the program's data into code every program shares. |

### query-library-decides-when-never-what → use-case-leaves-decisions-to-the-domain-model · MUST

Where the binding units keep the remote-data cache, their query library decides when a use case runs, never what it decides. It decides when and how often an operation's use case runs, by its remote-data cache, retries, pauses, deduplication and persistence, and what it runs around a write only predicts the write's outcome and undoes the prediction.

| Why |
|---|
| a rule hidden in the library's configuration never reaches the domain model, so it is proven by no spec of the domain and skipped by every other caller of the operation. |

### write-prediction-made-by-the-domain-model → use-case-leaves-decisions-to-the-domain-model · MUST

Where the binding units keep the remote-data cache, their query library predicts a write's outcome only by the domain model's pure functions. Such functions include a checked constructor and a derived value.

| Why |
|---|
| a prediction written by hand beside the domain model copies its rules, so it is proven by no spec of the domain and shows the user an outcome the domain model would not give. |

### offline-path-left-to-its-use-case → use-case-leaves-decisions-to-the-domain-model · MUST

Where the binding units keep the remote-data cache, their query library never pauses the use case that decides what happens offline.

| Why |
|---|
| a pause the library takes before the use case runs silently skips the offline path the use case holds, so the business's answer for a lost connection is never given. |

## Keys and refreshes

### cache-key-built-by-its-owners-factory → fact-has-one-source · MUST

Every cache key is built only by its owner's key factory, never written by hand. The owner is the feature or the composition module that owns the key's operation.

| Why |
|---|
| a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh — a single source of truth. |

### write-invalidates-what-it-changed → code-placed-by-its-reason-to-change · MUST

Every write's binding unit invalidates the cached data the write changed. Exempt: an adapter cache, which the adapter that makes the write invalidates.

| Why |
|---|
| an invalidation made away from the write that knows what it changed reloads too much or misses what changed, so the program shows stale data. |

### write-invalidates-only-its-features-keys → code-placed-by-its-reason-to-change · SHOULD

Every write's binding unit invalidates only its own feature's keys, named through its feature's key factory. A refresh across features is made by the composition module that combines them, through a refresh each feature's surface offers, or left to staleness.

| Why |
|---|
| a feature that invalidates another's keys knows that feature's keys, so it breaks whenever they change, through a coupling no import rule sees. |
