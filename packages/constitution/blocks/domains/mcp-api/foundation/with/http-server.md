# HTTP server

> Governs the origins a tool server over HTTP answers, a server on the user’s machine, and how it tells a client where to get a token.

## Origins

### tool-server-refuses-a-foreign-origin → state-changing-request-refused-from-other-origins · MUST

A tool server over HTTP answers `403` to every request — reading or not — whose `Origin` is present and not on its allowlist, and one on loopback also refuses a `Host` that is not a loopback name.

| Why |
|---|
| DNS rebinding lets any web page reach a server on the user's machine or network, and every call to a tool server may act. |

### local-tool-server-reachable-only-from-its-machine · SHOULD

A tool server over HTTP meant to run on the user's machine binds the loopback address and requires a token.

| Why |
|---|
| a server bound to every interface serves the whole network the machine sits on. |

## Authorization

### tool-server-announces-its-authorization-server · MUST

A tool server that uses MCP's authorization publishes its Protected Resource Metadata (RFC 9728), answers a missing or invalid token with `401` and a `WWW-Authenticate` naming it, and a token short of a scope with `403`, `error="insufficient_scope"` and the scopes required.

| Why |
|---|
| a client learns where to sign in, and which scope to ask for, only from these answers. |
