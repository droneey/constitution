# Accounts

> Governs how an answer shaped by its caller is cached, how a refused caller and a delete of a resource its caller may not see are answered, and whom a socket acts for.

## Caches

### personal-answer-kept-out-of-shared-caches → caller-shaped-result-never-served-from-a-cache-to-another · MUST

Every answer shaped by its caller, such as one of their own data, their rights or their tenant, sets `Cache-Control: private` or `no-store`.

| Why |
|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. |

### shared-cache-never-told-to-store-a-personal-answer → caller-shaped-result-never-served-from-a-cache-to-another · MUST

No shared cache in front of the server is given a rule that stores an answer shaped by its caller. Such a cache is a content delivery network's or a proxy's, for one.

| Why |
|---|
| a rule of the shared cache that overrides the answer's own directive keeps one caller's answer and serves it to the next. |

## Refusals

### unauthenticated-request-answered-401 · MUST

Where an operation needs a verified identity, every request it refuses for want of valid credentials is answered `401`. The answer carries a `WWW-Authenticate` challenge. Exempt: a page a browser navigates to, which is sent to sign in.

| Why |
|---|
| a caller tells a missing sign-in from a missing right by the status alone, and a `401` without its challenge leaves it no way to sign in. |

### unauthorised-request-answered-403 · MUST

Every request whose valid credentials lack the right is answered `403`. Exempt: a request naming an object the program answers to that caller as not found, and a refusal that a protocol carried over HTTP answers inside its own answer, such as a JSON-RPC result or error.

| Why |
|---|
| a `401` sent to a signed-in caller only sends it to sign in again, where the right it lacks is still missing. |

### hidden-resource-delete-answers-as-absent → hidden-object-answered-as-not-found · MUST

Every `DELETE` of an object hidden from its caller deletes nothing and answers as a `DELETE` of an identifier that names nothing. An object is hidden from its caller where the program answers it to that caller as not found.

| Why |
|---|
| a `DELETE` of a hidden resource answered otherwise than one of an identifier that names nothing, such as success where that one answers `404`, tells its caller the resource exists. |

## Sockets

### socket-acts-for-a-person-only-on-valid-credentials → operation-access-checked-on-every-call · MUST

Every WebSocket that acts for a signed-in person acts only while that person's session is valid. It checks their credentials at the upgrade, and closes once that session ends.

| Why |
|---|
| a socket outlives the request that opened it, so one checked only at its upgrade keeps acting for a person who signed out in another tab, or whose session was ended because it was stolen. |
