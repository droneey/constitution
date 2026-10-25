# Access control

> Governs the tokens a tool server accepts and the consent a proxy asks.

## Tokens

### tool-server-accepts-only-tokens-issued-for-it → token-verified-before-it-is-trusted · MUST

A tool server that authorises callers by token accepts only a token whose audience is the server's own canonical URI, and refuses any other.

| Why |
|---|
| a token issued for another service and accepted here lets whoever holds it reach this server too. |

## Proxies

### proxy-server-asks-consent-per-client · MUST

A tool server that reaches a third party's API under one client id of its own obtains the user's consent for each client registered with it before it forwards to the third party's authorization, matches each `redirect_uri` exactly and uses each `state` once.

| Why |
|---|
| the third party's consent cookie otherwise sends an authorization code to an attacker's registered redirect. |

## Caching

### caller-shaped-result-cached-privately · MUST

A result shaped by its caller's rights — a list of tools, a resource read — sets its `cacheScope` to `private`, never `public`.

| Why |
|---|
| a gateway that caches a public result hands one caller's tools and data to the next. |
