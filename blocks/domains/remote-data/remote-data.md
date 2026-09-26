---
id: remote-data
kind: domain
summary: Data another system owns — ports, cache keys, invalidation, streams.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Remote data

> Data another system owns, which the program reads, caches and changes through that system. The ports and adapters follow core; this block says how the data is cached, keyed, invalidated and streamed.

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
One shared mapper turns transport failures into domain errors: it handles unauthorized and unexpected failures itself and takes each feature's map of codes.
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

## invalidation-stays-in-its-feature · SHOULD
A write invalidates only its own feature's keys. A refresh across features is coordinated by the composing layer, or left to staleness.
**Why:** a feature that invalidates another's keys knows that feature, which the laws forbid.
**Check:** review
**Tags:** data, architecture
**Implements:** `features-blind-to-each-other`

## stream-as-async-iterable-of-domain-events · SHOULD
A progressive result is an asynchronous sequence of domain events the port returns: its end completes it, a domain error fails it, and stopping the loop cancels it. The events are a union declared in the port's file. The adapter maps wire events and drops unknown ones. A stream a write causes is a command; a passive subscription is a query.
**Why:** the domain sees its own events in its own words, and the transport can change without touching it.
**Check:** review
**Tags:** architecture, data
**Implements:** `contracts-know-no-vendor-or-other-contract`

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain, and the stream reaches the cache in batches, at most once per frame.
**Why:** the fold is tested without a network, and a fast stream does not redraw the screen on every event.
**Check:** review
**Tags:** data, performance
**Implements:** `fast-source-updates-once-per-frame`

## stream-ends-with-terminal-event · SHOULD
A stream that ends without its terminal event fails with a domain error.
**Why:** a stream cut short otherwise looks like a complete one, and the user sees a partial result as final.
**Check:** test
**Tags:** errors
**Implements:** `errors-surfaced-never-swallowed`

## reads-cancellable-latest-wins · SHOULD
Every read can be cancelled; a read superseded for the same key is cancelled, and only the latest answer reaches the cache.
**Why:** answers that arrive out of order otherwise show data for a question the user no longer asks.
**Check:** review
**Tags:** data, performance
**Implements:** `io-has-timeout-and-cancellation`

## no-second-model-of-remote-data · SHOULD
Where another system owns the data, the program keeps no aggregates, domain events, event sourcing or specifications of its own. Only what the program owns — a draft, an optimistic item — gets a validating factory.
**Why:** a second model of someone else's data duplicates their rules, and disagrees with them the first time they change.
**Check:** review
**Tags:** architecture
**Implements:** `entities-guarded-where-the-program-owns-them`

## Requirements for implementation

What any cache of remote data, and any transport it reads through, must provide.

## remote-data-cache-dedupes-by-key · MUST
Reads with one key share one request and one entry.
**Why:** without it, two components that show the same data make two requests and may show two answers.
**Check:** review
**Tags:** data, performance

## remote-data-cache-invalidates-by-prefix · MUST
The cache invalidates by a prefix of the key, with or without a refetch.
**Why:** a feature's key factory builds keys by prefix, and a write must be able to refresh all of them.
**Check:** review
**Tags:** data

## remote-data-cache-cancels-reads · MUST
Reads in flight for a key can be cancelled.
**Why:** without it, neither latest-wins reads nor safe optimistic writes are possible.
**Check:** review
**Tags:** data

## remote-data-cache-mutation-lifecycle · MUST
A write has hooks before it runs, on failure and after it settles, with a context for rollback, and the variables of pending writes can be read.
**Why:** the optimistic lifecycle is built on these hooks.
**Check:** review
**Tags:** data

## remote-data-cache-global-error-hook · SHOULD
One handler sees every failed read and write.
**Why:** an expired session is handled once, there.
**Check:** review
**Tags:** errors

## remote-data-cache-staleness-policy · SHOULD
Staleness and refetching are set per key.
**Why:** data that changes every second and data that never changes need different policies.
**Check:** review
**Tags:** data, performance

## remote-data-transport-timeout-and-cancel · MUST
The transport sets a timeout on every request, per call, and cancels a request by signal.
**Why:** without it, no request can meet the rule that it times out and can be cancelled.
**Check:** review
**Tags:** errors, performance

## remote-data-transport-typed-failures · MUST
The transport tells a status failure, a network failure and a timeout apart, for the mapper.
**Why:** each is a different domain error, with a different next step for the user.
**Check:** review
**Tags:** errors

## remote-data-transport-retries-only-transient · SHOULD
Retries are configurable by method and status, with backoff, and off for writes that are not idempotent.
**Why:** a retried write that is not idempotent repeats its effect.
**Check:** review
**Tags:** errors

## remote-data-transport-built-by-the-root · SHOULD
One configured instance — base address, headers, credentials — is built by the composition root and passed to the adapters that need it.
**Why:** every adapter then speaks to the server the same way, and a test passes them another instance.
**Check:** review
**Tags:** architecture
