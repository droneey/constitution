# Remote data

## server-owns-remote-data · MUST
The remote system owns its data: it lives only in the cache of remote data, is never copied into a store, and the program never becomes a second source of it.
**Why:** a copy of remote data in a store goes stale the moment the server changes it, and the screen shows the copy.
**Check:** review
**Tags:** data
**Implements:** `one-home-per-datum`

## responses-parsed-in-the-adapter · MUST
Every response is parsed against its wire schema in the adapter before it is mapped, so a change of the wire fails at that one boundary.
**Why:** an unparsed response carries whatever the server sent into the domain, and it fails far from the cause.
**Check:** review
**Tags:** data, security
**Implements:** `untrusted-input-parsed-at-edge`

## transport-failures-mapped-once · SHOULD
One shared mapper turns transport failures into domain errors: it maps unauthorized and unexpected failures to shared domain errors itself and takes each feature's map of codes. It only maps: the unauthorized error it returns is acted on afterwards, once, by the cache's global error handler.
**Why:** every adapter then fails the same way, and a feature states only what is its own.
**Check:** review
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`

## cache-keys-from-feature-factory · MUST
Each feature owns one key factory, and every cache key is built through it from the port's parameters, never by hand.
**Why:** a key written by hand in two places drifts, and an invalidation then misses the data it meant to refresh.
**Check:** review
**Tags:** data
**Implements:** `one-home-per-datum`

## invalidation-stays-in-its-feature · MUST
A write invalidates only its own feature's keys. A refresh across features is coordinated by the composing layer, or left to staleness.
**Why:** a feature that invalidates another's keys knows that feature, which the laws forbid.
**Check:** review
**Tags:** data
**Implements:** `features-blind-to-each-other`

## stream-as-async-iterable-of-domain-events · MUST
A progressive result is an asynchronous sequence of domain events the port returns: its end completes it, a domain error fails it, and stopping the loop cancels it. The events are a union declared in the port's file. The adapter maps wire events and drops unknown ones. A stream a write causes is a command; a passive subscription is a query.
**Why:** the domain sees its own events in its own words, and the transport can change without touching it.
**Check:** review
**Tags:** data
**Implements:** `contracts-know-no-vendor-or-other-contract`

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain before they reach the cache.
**Why:** the fold is tested without a network, and the transport can change without touching it.
**Check:** review
**Tags:** data

## no-second-model-of-remote-data · SHOULD
Where another system owns the data, the program keeps no aggregates, domain events, event sourcing or specifications of its own. Only what the program owns — a draft, an optimistic item — gets a validating factory.
**Why:** a second model of someone else's data duplicates their rules, and disagrees with them the first time they change.
**Check:** review
**Implements:** `entities-guarded-where-the-program-owns-them`

## remote-data-transport-built-by-the-root · SHOULD
One configured instance — base address, headers, credentials — is built by the composition root and passed to the adapters that need it.
**Why:** every adapter then speaks to the server the same way, and a test passes them another instance.
**Check:** review
