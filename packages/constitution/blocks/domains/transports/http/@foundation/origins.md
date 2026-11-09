# Origins

> Governs which other origins a server answers, and the origin it names for itself.

## Vocabulary

A request is **credentialed** when it carries what the browser attaches itself: a cookie, HTTP authentication or a client certificate.

## Other origins

### credentialed-request-allowed-only-from-listed-origins → outside-address-followed-only-from-an-allowlist · MUST

Every credentialed request from another origin is allowed only for an origin the program's allowlist names exactly. The program never echoes a request's `Origin` unchecked, and never answers `Access-Control-Allow-Origin: *` beside `Access-Control-Allow-Credentials: true`.

#### Why

A browser sends a user's cookies with a cross-origin request, so an origin allowed unchecked reads the program's answers in that user's name, while an answer to a request without them holds only what any caller outside a browser reads.

#### Examples

```pseudo title="Avoid"
function corsHeaders(request)
  return {
    "Access-Control-Allow-Origin": request.headers["Origin"],
    "Access-Control-Allow-Credentials": "true",
  }
```

```pseudo title="Prefer"
let allowedOrigins = set(["https://shop.example", "https://admin.shop.example"])

function corsHeaders(request)
  let origin = request.headers["Origin"]

  if not allowedOrigins.has(origin) then
    return { "Vary": "Origin" }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  }
```

### state-changing-request-refused-from-other-origins → outside-address-followed-only-from-an-allowlist · MUST

Every credentialed request that changes state is refused from an origin the program does not trust. It is refused when its `Origin` names an origin that is neither the program's own nor on its allowlist or, where it carries no `Origin`, when its `Sec-Fetch-Site` is neither `same-origin` nor `none`. Exempt: a request with neither header, which no browser sends.

#### Why

A browser attaches its cookies to a request any page sends, and `SameSite` still lets a sibling host of the same site through, so without this check a page the user visits changes their data in their name — defence in depth.

#### Examples

```pseudo title="Avoid"
function guardOrigin(request)
  if request.method in ["POST", "PUT", "PATCH", "DELETE"]
      and request.headers["Origin"] is not <absent>
      and request.headers["Origin"] != config.ownOrigin then
    return forbidden()
```

```pseudo title="Prefer"
function guardOrigin(request)
  if request.method in ["GET", "HEAD", "OPTIONS"] then
    return

  let origin = request.headers["Origin"]
  let site = request.headers["Sec-Fetch-Site"]

  if origin is not <absent> then
    if origin != config.ownOrigin and not allowedOrigins.has(origin) then
      return forbidden()
  else if site is not <absent> and site not in ["same-origin", "none"] then
    return forbidden()
```

## Own origin

### own-origin-taken-from-configuration · MUST

Every absolute address the program builds of itself takes its origin from configuration, never from the request's `Host` or `X-Forwarded-Host`. Such addresses include a link to reset a password, a callback and a redirect.

#### Why

A request's host is the sender's to choose, so a reset link built from it sends the person's token to the attacker's server.

#### Examples

```pseudo title="Avoid"
# accounts/infrastructure/mail/reset-link.adapter
function resetLink(token, request)
  return "https://" + request.headers["Host"] + "/reset?token=" + token
```

```pseudo title="Prefer"
# accounts/infrastructure/mail/reset-link.adapter
function createResetLink({ publicOrigin })
  return function(token)
    return new Url("/reset?token=" + token, publicOrigin)
```

## Connections

### socket-upgrade-accepted-only-from-an-allowed-origin → outside-address-followed-only-from-an-allowlist · MUST

Every credentialed WebSocket upgrade is accepted only from the program's own origin or one its allowlist names. Exempt: an upgrade with no `Origin`, which no browser sends.

#### Why

An upgrade is a `GET` no cross-origin policy guards, so without the check any page the person visits opens a socket with their cookies.

#### Examples

```pseudo title="Avoid"
server.onUpgrade("/orders/live", function(request, socket)
  let person = sessionFrom(request.cookies)

  accept(socket, person))
```

```pseudo title="Prefer"
server.onUpgrade("/orders/live", function(request, socket)
  let origin = request.headers["Origin"]

  if origin is not <absent>
      and origin != config.ownOrigin
      and not allowedOrigins.has(origin) then
    return socket.refuse(403)

  accept(socket, sessionFrom(request.cookies)))
```
