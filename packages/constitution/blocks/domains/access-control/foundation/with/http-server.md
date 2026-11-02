# HTTP server

> Governs the cookie that carries a session, and how a refused caller is answered.

## Cookies

### session-cookie-closed-to-script · MUST

A session cookie is closed to script and to plain HTTP, and sent on no request another site starts but a top-level navigation. The server keeps such a session for a caller signed in from a browser in a cookie set `HttpOnly`, `Secure` and `SameSite=Lax` or `Strict`, named `__Host-` — with `Path=/` and no `Domain` — when the program's own tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does.

| Why |
|---|
| a cookie a script can read is taken by the first script injected into the page, one sent over plain HTTP by whoever watches the network, one carried on a request another site starts in the background acts for that site, and one without the prefix is replaced by a sibling host's. |

## Authentication

### refused-request-answered-401-or-403 · MUST

A refused request is answered `401` or `403` by what it lacks. A request without valid credentials is answered `401` with a `WWW-Authenticate` challenge, save a page a browser navigates to, which is sent to sign in; one with valid credentials that lack the right is answered `403` where the caller may know the object exists.

| Why |
|---|
| a client tells a missing sign-in from a missing right by the status alone, so a `401` sent to a signed-in caller only sends it to sign in again, and one without its challenge leaves it no way to sign in. |

### sign-in-refused-from-other-origins → state-changing-request-refused-from-other-origins · MUST

A request that signs a person in with what they typed is refused from another origin, by the same check. The answer of an outside identity provider, which its `state`, PKCE and `nonce` guard, is not.

| Why |
|---|
| a sign-in posted from another site signs the person into the attacker's account, while the provider's answer comes from another site by design. |
