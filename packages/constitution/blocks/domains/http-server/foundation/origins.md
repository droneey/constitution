# Origins

> Governs which other origins a server answers.

A request is **credentialed** when it carries what the browser attaches itself: a cookie, HTTP authentication or a client certificate.

## Other origins

### credentialed-request-allowed-only-from-listed-origins → outside-address-followed-only-from-an-allowlist · MUST

A credentialed request from another origin is allowed only for an origin the program's allowlist names exactly. For such a request the program never echoes a request's `Origin` unchecked, and never answers `Access-Control-Allow-Origin: *` beside `Access-Control-Allow-Credentials: true`; an answer to a request that is not credentialed may allow any origin.

| Why |
|---|
| a browser sends a user's cookies with a cross-origin request, so an origin allowed unchecked reads the program's answers in that user's name. |

### state-changing-request-refused-from-other-origins → outside-address-followed-only-from-an-allowlist · MUST

A request that changes state is refused from an origin the program does not trust. This holds for a credentialed request, which the server authenticates by what the browser attached: it is refused when its `Origin` names an origin that is neither the program's own nor on its allowlist, or, where it carries no `Origin`, when it carries a `Sec-Fetch-Site` that is neither `same-origin` nor `none`. A request with neither header, which no browser sends, is not refused by this check.

| Why |
|---|
| a browser attaches its cookies to a request any page sends, and `SameSite` still lets a sibling host of the same site through, so without this check a page the user visits changes their data in their name — defence in depth. |

## Own origin

### own-origin-taken-from-configuration · MUST

An absolute address the program builds of itself takes its origin from configuration. Such an address — a link to reset a password, a callback, a redirect — never takes it from the request's `Host` or `X-Forwarded-Host`.

| Why |
|---|
| a request's host is the sender's to choose, so a reset link built from it sends the person's token to the attacker's server. |

## Connections

### socket-upgrade-accepted-only-from-an-allowed-origin → outside-address-followed-only-from-an-allowlist · MUST

A credentialed WebSocket upgrade is accepted only from an allowed origin, and acts for a person only on valid credentials. Such an upgrade is accepted only from the program's own origin or one its allowlist names, and the socket acts for a signed-in person only with valid credentials.

| Why |
|---|
| an upgrade is a `GET` no cross-origin policy guards, so without the check any page the person visits opens a socket with their cookies. |
