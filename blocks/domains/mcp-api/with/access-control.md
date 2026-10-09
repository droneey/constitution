# MCP API with access control

> Governs the tokens a tool server accepts and the consent a proxy asks.

## Tokens

### tool-server-accepts-only-tokens-issued-for-it → token-verified-before-it-is-trusted · MUST
A tool server that authorises callers by token accepts only a token whose audience is the server's own canonical URI, and answers `401` to any other.

| Why | Tags |
|---|---|
| a token issued for another service and accepted here lets whoever holds it reach this server too. | [security] |

### tool-server-announces-its-authorization-server · MUST
A tool server that uses MCP's authorization publishes its Protected Resource Metadata (RFC 9728), answers a missing or invalid token with `401` and a `WWW-Authenticate` naming it, and a token short of a scope with `403`, `error="insufficient_scope"` and the scopes required.

| Why | Tags |
|---|---|
| a client learns where to sign in, and which scope to ask for, only from these answers. | [security] |

## Proxies

### proxy-server-asks-consent-per-client · MUST
A tool server that reaches a third party's API under one client id of its own obtains the user's consent for each client registered with it before it forwards to the third party's authorization, matches each `redirect_uri` exactly and uses each `state` once.

| Why | Tags |
|---|---|
| the third party's consent cookie otherwise sends an authorization code to an attacker's registered redirect. | [security] |
