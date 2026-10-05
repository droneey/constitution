# Remote service

## stream-ends-with-terminal-event → errors-surfaced-never-swallowed
A stream that ends without its terminal event fails with a typed error.

| Why | Check | Tags |
|---|---|---|
| a stream cut short otherwise looks like a complete one, and the user sees a partial result as final. | test | [] |

## Specs

## remote-vendor-proven-by-captured-responses · SHOULD
A remote vendor that cannot run in a sandbox is proven through its transport with captured responses.

| Why | Check | Tags |
|---|---|---|
| the vendor's engine runs only on the vendor's side, so its answers, captured once, are the closest a spec can come to it. | review | [testing] |

## captured-responses-verified-against-the-vendor · SHOULD
Each captured response of a remote vendor is checked against the vendor by a contract run, which captures it again and reports any difference. A system of the same repository is no vendor: its captured responses are checked against its own contract in the check.

| Why | Check | Tags |
|---|---|---|
| a vendor changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks; a system the repository holds changes in the same change as its contract, so the check can hold the two together. | review | [testing] |

## unmatched-request-fails-the-spec → tests-run-in-a-sandbox
A transport replaced by captured responses throws on a request none of them matches, naming its method and address.

| Why | Check | Tags |
|---|---|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real service. | review | [testing] |

## Requirements for implementation

What any transport to another system must provide.

## transport-timeout-and-cancel · MUST
The transport sets a timeout on every request, per call, and cancels a request by signal.

| Why | Check | Tags |
|---|---|---|
| without it, no request can meet the rule that it times out and can be cancelled. | review | [errors, performance] |

## transport-typed-failures · MUST
The transport tells a status failure, a network failure and a timeout apart, for the mapper.

| Why | Check | Tags |
|---|---|---|
| each maps to a different typed error, with a different next step for the user. | review | [errors] |

## transport-retries-only-transient · SHOULD
Retries are configurable by method and status, with backoff, and off for writes that are not idempotent.

| Why | Check | Tags |
|---|---|---|
| a retried write that is not idempotent repeats its effect. | review | [errors] |
