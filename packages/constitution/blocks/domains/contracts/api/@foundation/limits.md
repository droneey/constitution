# Limits

> Governs the most a request may ask and an answer may hold.

## Size

### request-bounded-in-what-it-asks · MUST

Every request is bounded in what it asks, and one past a bound is refused before it runs. The bounds cover the items of a batch and the cost of a nested query.

| Why |
|---|
| a request with no bound on what it asks lets one caller exhaust the memory, the disk or the time every caller shares, though its size passed every check. |

### answer-bounded-in-size · MUST

Every answer is bounded in size by a maximum the server holds.

| Why |
|---|
| an unbounded answer exhausts the caller that reads it and the server that builds it. |

### cut-answer-says-it-was-cut · MUST

Every answer cut to its maximum size says so. It either says how to narrow the request or carries the cursor of the rest.

| Why |
|---|
| a silent cut makes its caller believe it saw everything. |

## Rate

### caller-rate-limited · MUST

Every caller's requests are limited by rate, per caller, and a request over the limit is refused as rate-limited.

| Why |
|---|
| one caller, a runaway script or an attacker, otherwise takes the capacity every other caller needs. |

### costly-operation-limited-tighter · SHOULD

Every costly operation has a rate limit tighter than its caller's general one.

| Why |
|---|
| a limit set for cheap requests lets a caller spend, on a costly one, many times the capacity the limit meant to give it. |

### rate-refusal-says-when-to-retry · SHOULD

Every request refused for its rate says when to retry.

| Why |
|---|
| a caller not told when to come back retries at once, into the load that refused it. |
