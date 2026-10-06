---
id: remote-service
summary: "Another system the program calls: transport, failures, streams, specs."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Remote service

> Another system the program reaches over a network and does not run itself. This block says how the transport is built and bounded, how its answers are parsed and its failures mapped, how a stream of its events reaches the domain, and how the specs stand in for a system they cannot run, with its captured answers, and keep those answers true. An engine the project owns and runs, such as its database, is not a remote service; core's integration rules hold it.

### stream-ends-with-terminal-event → errors-surfaced-never-swallowed
A stream that ends without its terminal event fails with a typed error.

| Why | Tags |
|---|---|
| a stream cut short otherwise looks like a complete one, and the user sees a partial result as final. | [] |

## Specs

### remote-vendor-proven-by-captured-responses · SHOULD
A remote vendor that cannot run in a sandbox is proven through its transport with captured responses.

| Why | Tags |
|---|---|
| the vendor's engine runs only on the vendor's side, so its answers, captured once, are the closest a spec can come to it. | [testing] |

### captured-responses-verified-against-the-vendor · SHOULD
Each captured response of a remote vendor is verified against the vendor: captured again, with any difference reported. A system of the same repository is no vendor: its captured responses are checked against its own contract.

| Why | Tags |
|---|---|
| a vendor changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks; a system the repository holds changes in the same change as its contract, so a spec can hold the two together. | [testing] |

### unmatched-request-fails-the-spec → tests-run-in-a-sandbox
A transport replaced by captured responses throws on a request none of them matches, naming its method and address.

| Why | Tags |
|---|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real service. | [testing] |

## Requirements for implementation

What any transport to another system must provide.

### transport-timeout-and-cancel · MUST
The transport sets a timeout on every request, per call, and cancels a request by signal.

| Why | Tags |
|---|---|
| without it, no request can meet the rule that it times out and can be cancelled. | [errors, performance] |

### transport-typed-failures · MUST
The transport tells a status failure, a network failure and a timeout apart, for the mapper.

| Why | Tags |
|---|---|
| each maps to a different typed error, with a different next step for the user. | [errors] |

### transport-retries-only-transient · SHOULD
Retries are configurable by method and status, with backoff, and off for writes that are not idempotent.

| Why | Tags |
|---|---|
| a retried write that is not idempotent repeats its effect. | [errors] |
