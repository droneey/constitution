# Access control

> Governs the tokens a tool server accepts and announces, the person who completes an elicitation, the consent a proxy asks, and a result cached for its caller.

## Tokens

### tool-server-accepts-only-tokens-issued-for-it → token-verified-before-it-is-trusted · MUST

A tool server accepts only tokens issued for it. The audience it checks a token for is its own canonical URI, the `resource` a client names by RFC 8707.

| Why |
|---|
| a token issued for another service and accepted here lets whoever holds it reach this server too, and only the canonical URI is the same name for the client, the authorization server and the tool server — RFC 8707. |

### tool-server-announces-its-authorization-server · MUST

A tool server announces its authorization server and the scope a token lacks. One that uses MCP's authorization publishes its Protected Resource Metadata (RFC 9728) and names it in the `WWW-Authenticate` of its `401`, and answers a token short of a scope with `403`, `error="insufficient_scope"` and the scopes required.

| Why |
|---|
| a client learns where to sign in, and which scope to ask for, only from these answers, so without them it can neither sign in nor gain the scope it lacks — RFC 9728. |

## Elicitation

### url-elicitation-completed-by-the-same-user · MUST

A URL elicitation is completed only by the user it was issued for. The server checks this by its own sign-in before it keeps what the flow yields.

| Why |
|---|
| an attacker forwards the link to a victim and otherwise receives the victim's tokens. |

## Proxies

### proxy-server-asks-consent-per-client · MUST

A proxy tool server asks the user's consent for each client, and binds each authorization to it. A tool server that reaches a third party's API under one client id of its own obtains that consent for each client registered with it before it forwards to the third party's authorization, matches each `redirect_uri` exactly and uses each `state` once.

| Why |
|---|
| the third party's consent cookie otherwise sends an authorization code to an attacker's registered redirect. |

## Caching

### caller-shaped-result-cached-privately → caller-shaped-result-never-served-from-a-cache-to-another · MUST

A result shaped by its caller's rights is cached privately. Such a result — a list of tools, a resource read — sets its `cacheScope` to `private`, never `public`.

| Why |
|---|
| a gateway that caches a public result hands one caller's tools and data to the next. |
