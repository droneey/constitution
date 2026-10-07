# Origins

> Governs which other origins a server answers.

## Other origins

### cross-origin-request-allowed-only-from-an-allowlist → outside-address-followed-only-from-an-allowlist · MUST
A request from another origin that carries credentials is allowed only for an origin the program's allowlist names exactly: the program never echoes a request's `Origin` unchecked, and never answers `Access-Control-Allow-Origin: *` beside `Access-Control-Allow-Credentials: true`; a public answer that carries no credentials may allow any origin.

| Why | Tags |
|---|---|
| a browser sends a user's cookies with a cross-origin request, so an origin allowed unchecked reads the program's answers in that user's name. | [security] |

### state-changing-request-refused-from-other-origins → outside-address-followed-only-from-an-allowlist · MUST
A request that changes state is refused when its `Origin` names an origin that is neither the program's own nor on its allowlist, or, where it carries no `Origin`, when it carries a `Sec-Fetch-Site` that is neither `same-origin` nor `none`; a request with neither header, which no browser sends, is not refused by this check.

| Why | Tags |
|---|---|
| a browser attaches its cookies to a request any page sends, and `SameSite` still lets a sibling host of the same site through; this check refuses what the cookie's attribute misses. | [security] |
