---
id: access-control
summary: "Callers who sign in with different rights: identity, sessions, access."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Access control

> A program whose callers sign in and do not all have the same rights: who a caller is, the session that carries that identity, and what each caller may do. Access is denied unless a rule grants it, a test proves it, and each entry point declares its access where it is defined, in `architecture/`.

### access-denied-unless-granted · MUST
Access is denied unless a rule grants it, and a test proves the access of each operation a caller outside the program can reach: a route, an endpoint, a command.

| Why | Tags |
|---|---|
| access open by default is open wherever someone forgot a rule, and only a test notices the operation that forgot. | [security] |

### session-cookie-closed-to-script · MUST
A session the server keeps for a caller signed in from a browser travels in a cookie set `HttpOnly`, `Secure` and `SameSite=Lax` or `Strict`, named `__Host-` — with `Path=/` and no `Domain` — when the program's own tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does.

| Why | Tags |
|---|---|
| no script in the page can read the cookie, it never travels over plain HTTP, a request another site starts does not carry it, and the prefix keeps a sibling host from setting one in its place. | [security] |
