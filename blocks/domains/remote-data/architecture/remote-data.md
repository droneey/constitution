# Remote data

> The ports and adapters that reach the other system follow core.

## server-owns-remote-data → one-home-per-datum
The remote system owns its data: it lives only in the cache of remote data, is never copied into a store, and the program never becomes a second source of it.

| Why | Check | Tags |
|---|---|---|
| a copy of remote data in a store goes stale the moment the server changes it, and the screen shows the copy. | review | [] |

## responses-parsed-in-the-adapter → untrusted-input-parsed-at-edge
Every response is parsed against its wire schema in the adapter before it is mapped, so a change of the wire fails at that one boundary.

| Why | Check | Tags |
|---|---|---|
| an unparsed response carries whatever the server sent into the domain, and it fails far from the cause. | review | [data] |

## transport-failures-mapped-once → expected-failures-typed-with-codes
One shared mapper turns transport failures into domain errors: it maps unauthorized and unexpected failures to shared domain errors itself and takes each feature's map of codes. It only maps: the unauthorized error it returns is acted on afterwards, once, by the cache's global error handler.

| Why | Check | Tags |
|---|---|---|
| every adapter then fails the same way, and a feature states only what is its own. | review | [] |

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

## stream-as-async-iterable-of-domain-events → contracts-know-no-vendor-or-other-contract
A progressive result is an asynchronous sequence of domain events the port returns: its end completes it, a domain error fails it, and stopping the loop cancels it. The events are a union declared in the port's file. The adapter maps wire events and drops unknown ones. A stream a write causes is a command; a passive subscription is a query.

| Why | Check | Tags |
|---|---|---|
| the domain sees its own events in its own words, and the transport can change without touching it. | review | [data] |

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain before they reach the cache.

| Why | Check | Tags |
|---|---|---|
| the fold is tested without a network, and the transport can change without touching it. | review | [data] |

## no-second-model-of-remote-data → entities-guarded-where-the-program-owns-them
Whoever decides whether a change is valid owns the data. Where another system decides, the program keeps no aggregates, domain events, event sourcing or specifications of its own for that data; what the program decides itself — a draft, an optimistic item, the folding of a stream, a grouping by period — it models in its domain.

| Why | Check | Tags |
|---|---|---|
| a second model of someone else's data duplicates their rules, and disagrees with them the first time they change. | review | [] |

## remote-data-transport-built-by-the-root · SHOULD
One configured instance — base address, headers, credentials — is built by the composition root and passed to the adapters that need it.

| Why | Check | Tags |
|---|---|---|
| every adapter then speaks to the server the same way, and a test passes them another instance. | review | [] |
