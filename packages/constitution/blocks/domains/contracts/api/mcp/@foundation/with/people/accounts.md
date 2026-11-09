# Accounts

> Governs the tokens a tool server accepts and announces, the person who completes an elicitation, the approval a proxy asks, and a result cached for its caller.

## Vocabulary

A **proxy tool server** is a tool server that reaches a third party's API under one client id of its own.

## Tokens

### tool-server-accepts-only-tokens-issued-for-it → token-verified-before-it-is-trusted · MUST

Every tool server accepts only tokens issued for it, checking their audience against its own canonical URI. That URI is the `resource` a client names by RFC 8707.

#### Why

A token issued for another service and accepted here lets whoever holds it reach this server too, and only the canonical URI is the same name for the client, the authorization server and the tool server — RFC 8707.

#### Examples

```pseudo title="Avoid"
function verifyToken(token)
  return verifySignedToken(token, issuerKeys)
```

```pseudo title="Prefer"
let canonicalUri = "https://mcp.shop.example.com"

function verifyToken(token)
  let claims = verifySignedToken(token, issuerKeys)

  if not claims.audience.contains(canonicalUri) then
    throw new TokenAudienceRefusedError(claims.audience)

  return claims
```

### tool-server-announces-its-authorization-server · MUST

Wherever a tool server serves over HTTP and uses MCP's authorization, it publishes its Protected Resource Metadata (RFC 9728). It names that metadata in the `WWW-Authenticate` of its `401`.

#### Why

A client learns where to sign in only from these answers, so without them it cannot sign in at all — RFC 9728.

#### Examples

```text title="Avoid"
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://mcp.shop.example.com/.well-known/oauth-protected-resource"
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

GET /.well-known/oauth-protected-resource HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "resource": "https://mcp.shop.example.com",
  "authorization_servers": ["https://auth.shop.example.com"]
}
```

### tool-server-names-the-scope-a-token-lacks · MUST

Wherever a tool server uses MCP's authorization, its answer to every token short of a scope names the scopes required. Its `WWW-Authenticate` names them beside `error="insufficient_scope"`.

#### Why

A client learns which scope to ask for only from this answer, so without it the client cannot gain the scope it lacks.

#### Examples

```text title="Avoid"
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope"
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", scope="orders:read orders:refund", resource_metadata="https://mcp.shop.example.com/.well-known/oauth-protected-resource"
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

## Elicitation

### url-elicitation-completed-by-the-same-user · MUST

Every URL elicitation is carried out only by the user it was issued for. The server checks this by its own sign-in before it keeps what the flow yields.

#### Why

An attacker forwards the link to a victim and otherwise receives the victim's tokens.

#### Examples

```pseudo title="Avoid"
function completeConnect(request)
  let elicitation = elicitations.find(request.query.elicitationId)

  call connections.keep(elicitation.userId, exchangeCode(request.query.code))
```

```pseudo title="Prefer"
function completeConnect(request)
  let elicitation = elicitations.find(request.query.elicitationId)
  let user = sessions.signedInUser(request)

  if user is <absent> then
    return redirectToSignIn(request)

  if user.id is not elicitation.userId then
    throw new ElicitationUserMismatchError(elicitation.id)

  call connections.keep(user.id, exchangeCode(request.query.code))
```

## Proxies

### proxy-server-asks-approval-per-client · MUST

Every proxy tool server asks the user to approve each client before forwarding it to the third party's authorization.

#### Why

The third party's cookie of an earlier approval otherwise sends an authorization code to an attacker's registered redirect — the confused deputy of MCP's security best practices.

#### Examples

```pseudo title="Avoid"
function authorize(request, user)
  let client = clients.find(request.query.client_id)

  return redirect(thirdPartyAuthorizeUrl(client, request.query))
```

```pseudo title="Prefer"
function authorize(request, user)
  let client = clients.find(request.query.client_id)

  if not clientApprovals.has(user.id, client.id) then
    return clientApprovalPage(client, request.query)

  return redirect(thirdPartyAuthorizeUrl(client, request.query))
```

### proxy-server-matches-each-redirect-exactly · MUST

Every proxy tool server matches each client's `redirect_uri` exactly.

#### Why

A redirect matched by prefix sends the authorization code to whatever address shares the prefix.

#### Examples

```pseudo title="Avoid"
function checkRedirect(client, redirectUri)
  if not redirectUri.startsWith(client.redirectUri) then
    throw new RedirectUriRefusedError(redirectUri)
```

```pseudo title="Prefer"
function checkRedirect(client, redirectUri)
  if not client.redirectUris.contains(redirectUri) then
    throw new RedirectUriRefusedError(redirectUri)
```

### proxy-server-uses-each-state-once · MUST

Every proxy tool server binds each authorization to its client by a `state` it uses once.

#### Why

A `state` used again lets an attacker replay one client's authorization into another's flow.

#### Examples

```pseudo title="Avoid"
function onThirdPartyCallback(request)
  let pending = pendingAuthorizations.find(request.query.state)

  if pending is <absent> then
    throw new AuthorizationStateRefusedError()

  return finishAuthorization(pending.clientId, request.query.code)
```

```pseudo title="Prefer"
function onThirdPartyCallback(request)
  let pending = pendingAuthorizations.take(request.query.state)

  if pending is <absent> then
    throw new AuthorizationStateRefusedError()

  return finishAuthorization(pending.clientId, request.query.code)
```

## Caching

### caller-shaped-result-cached-privately → caller-shaped-result-never-served-from-a-cache-to-another · MUST

Every result shaped by its caller's rights sets its `cacheScope` to `private`, never `public`. Such a result is a list of tools or a resource read, for one.

#### Why

A gateway that caches a public result hands one caller's tools and data to the next.

#### Examples

```text title="Avoid"
tools/list answer for a store manager
{
  "resultType": "complete",
  "tools": [ orders_search, orders_refund, staff_list ],
  "ttlMs": 300000,
  "cacheScope": "public"
}
```

```text title="Prefer"
tools/list answer for a store manager
{
  "resultType": "complete",
  "tools": [ orders_search, orders_refund, staff_list ],
  "ttlMs": 300000,
  "cacheScope": "private"
}
```
