# Access control over HTTP

> Governs the cookie that carries a session, and how a refused caller is answered.

## Cookies

### session-cookie-closed-to-script · MUST
A session the server keeps for a caller signed in from a browser travels in a cookie set `HttpOnly`, `Secure` and `SameSite=Lax` or `Strict`, named `__Host-` — with `Path=/` and no `Domain` — when the program's own tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does.

| Why | Tags |
|---|---|
| no script in the page can read the cookie, it never travels over plain HTTP, a request another site starts does not carry it, and the prefix keeps a sibling host from setting one in its place. | [security] |

## Authentication

### unauthenticated-request-answered-401-with-a-challenge · MUST
A request without valid credentials is answered `401` with a `WWW-Authenticate` challenge, save a page a browser navigates to, which is sent to sign in, and one whose credentials lack a right for an object the caller may see `403`.

| Why | Tags |
|---|---|
| a client tells a missing sign-in from a missing right by the status alone, and the challenge says how to sign in. | [security] |
