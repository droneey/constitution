# Limits

> Governs the most a request may ask and an answer may hold.

## Size

### request-size-bounded → outside-input-bounded-before-it-is-parsed · MUST

A request is bounded in its size and in what it asks. Its bounds cover each file it uploads, the items of a batch, and the depth and the cost of a nested query, and a request beyond a bound is refused before it is read whole.

| Why |
|---|
| a request with no bound lets one caller exhaust the memory, the disk or the time every caller shares. |

### answer-bounded-in-size · MUST

Every answer is bounded in size. The server holds a maximum size for it; an answer cut to it says so, and either says how to narrow the request or carries the cursor of the rest.

| Why |
|---|
| an unbounded answer exhausts the caller that reads it, and a silent cut makes it believe it saw everything. |

## Rate

### caller-rate-limited · SHOULD

A caller's requests are limited by rate. The limit is per caller and tighter for a costly operation, and a request over it is refused as rate-limited, saying when to retry.

| Why |
|---|
| one caller, a runaway script or an attacker, otherwise takes the capacity every other caller needs, and a caller not told when to come back retries at once. |
