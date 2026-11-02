# Methods

> Governs what a method and a status mean, what a method may change, and how a repeated delete is answered.

## General

### method-and-status-mean-what-http-registers · MUST

A method and a status are used in the meaning RFC 9110 and the IANA registries give them. A failure never travels under a success status, nor a success under a failure's, and a request by a safe method — `GET`, `HEAD`, `OPTIONS` — changes no state.

| Why |
|---|
| clients, proxies, caches and retrying libraries act on the method and the status alone: they repeat a `PUT` or a `DELETE` on their own, a failure sent as `200` is cached, counted as a success and never retried, and a link, a prefetch, a crawler or a cache sends a safe method's request without anyone meaning its effect, as a forged page does with the user's cookies — RFC 9110 and the IANA registries. |

### repeated-delete-answers-success · MUST

A `DELETE` of a resource that is already gone answers success, never `404`. It answers as the first `DELETE` of it did, so a repeat after a lost answer reads as done. Two answers come before it, in this order: a repeat that carries an idempotency key already seen is answered from that key's record, and a request whose precondition fails, as an `If-Match` with no resource to match, answers `412`.

| Why |
|---|
| a client, or the library it calls through, repeats a `DELETE` whose first answer it lost, and a `404` then reads as the failure of a delete that succeeded, so it reports an error for what is done or tries again what cannot change; a failed precondition answered with success hides from its client that the resource changed since its read, and a key's own repeat answered `412` fails a retry whose first attempt did the delete. |
