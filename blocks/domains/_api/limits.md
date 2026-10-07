# Limits

> Governs the most a request may ask and an answer may hold.

## Size

### request-size-bounded → outside-input-bounded-before-it-is-parsed · MUST
A request is bounded in its size and in what it asks — each file it uploads, the items of a batch, the depth and the cost of a nested query — and one beyond a bound is refused before it is read whole.

| Why | Tags |
|---|---|
| a request with no bound lets one caller exhaust the memory, the disk or the time every caller shares. | [performance, security] |

### answer-bounded-in-size · MUST
Every answer has a maximum size the server holds; an answer cut to it says so, and how to narrow the request or carries the cursor of the rest.

| Why | Tags |
|---|---|
| an unbounded answer exhausts the caller that reads it, and a silent cut makes it believe it saw everything. | [performance] |

## Rate

### caller-rate-limited · SHOULD
A caller's requests are limited by rate, per caller and tighter for a costly operation, and a request over the limit is refused as rate-limited.

| Why | Tags |
|---|---|
| one caller, a runaway script or an attacker, otherwise takes the capacity every other caller needs. | [performance, security] |
