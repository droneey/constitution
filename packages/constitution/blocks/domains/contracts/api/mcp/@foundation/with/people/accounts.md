# Accounts

> Governs the tokens a tool server accepts and announces, the person who completes an elicitation, the approval a proxy asks, and a result cached for its caller.

## Vocabulary

A **proxy tool server** is a tool server that reaches a third party's API under one client id of its own.

## Tokens

### tool-server-accepts-only-tokens-issued-for-it → token-verified-before-it-is-trusted · MUST

Every tool server accepts only tokens issued for it, checking their audience against its own canonical URI. That URI is the `resource` a client names by RFC 8707.

| Why |
|---|
| a token issued for another service and accepted here lets whoever holds it reach this server too, and only the canonical URI is the same name for the client, the authorization server and the tool server — RFC 8707. |

### tool-server-announces-its-authorization-server · MUST

Wherever a tool server serves over HTTP and uses MCP's authorization, it publishes its Protected Resource Metadata (RFC 9728). It names that metadata in the `WWW-Authenticate` of its `401`.

| Why |
|---|
| a client learns where to sign in only from these answers, so without them it cannot sign in at all — RFC 9728. |

### tool-server-names-the-scope-a-token-lacks · MUST

Wherever a tool server uses MCP's authorization, its answer to every token short of a scope names the scopes required. Its `WWW-Authenticate` names them beside `error="insufficient_scope"`.

| Why |
|---|
| a client learns which scope to ask for only from this answer, so without it the client cannot gain the scope it lacks. |

## Elicitation

### url-elicitation-completed-by-the-same-user · MUST

Every URL elicitation is carried out only by the user it was issued for. The server checks this by its own sign-in before it keeps what the flow yields.

| Why |
|---|
| an attacker forwards the link to a victim and otherwise receives the victim's tokens. |

## Proxies

### proxy-server-asks-approval-per-client · MUST

Every proxy tool server asks the user to approve each client before forwarding it to the third party's authorization.

| Why |
|---|
| the third party's cookie of an earlier approval otherwise sends an authorization code to an attacker's registered redirect — the confused deputy of MCP's security best practices. |

### proxy-server-matches-each-redirect-exactly · MUST

Every proxy tool server matches each client's `redirect_uri` exactly.

| Why |
|---|
| a redirect matched by prefix sends the authorization code to whatever address shares the prefix. |

### proxy-server-uses-each-state-once · MUST

Every proxy tool server binds each authorization to its client by a `state` it uses once.

| Why |
|---|
| a `state` used again lets an attacker replay one client's authorization into another's flow. |

## Caching

### caller-shaped-result-cached-privately → caller-shaped-result-never-served-from-a-cache-to-another · MUST

Every result shaped by its caller's rights sets its `cacheScope` to `private`, never `public`. Such a result is a list of tools or a resource read, for one.

| Why |
|---|
| a gateway that caches a public result hands one caller's tools and data to the next. |
