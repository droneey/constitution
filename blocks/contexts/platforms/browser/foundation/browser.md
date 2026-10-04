# Browser

## runtime-configuration-served-beside-bundle · MUST
One bundle serves every environment: its configuration is served beside it, and no environment value is baked into the bundle.

| Why | Check | Tags |
|---|---|---|
| one tested bundle is promoted from staging to production unchanged, and nothing environment-specific is published inside it. | review | [security] |

## bundle-reads-no-build-environment → runtime-configuration-served-beside-bundle
Browser code never reads `process.env`.

| Why | Check | Tags |
|---|---|---|
| a bundler fills it in at build time, and bakes one environment's values into the bundle. | tool/types | [security] |

## no-credential-readable-by-script → credentials-only-in-the-protected-store
A credential in the tab lives only in a cookie its script cannot read — `HttpOnly`, `Secure`, `SameSite`, named `__Host-` when the program's own tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does — never in web storage, IndexedDB or the script's memory: the tab holds no bearer token.

| Why | Check | Tags |
|---|---|---|
| a cookie the page's script cannot read is the one store of a tab that no script in the page can reach. | review | [security] |

## strict-content-security-policy · MUST
Every document is served with a Content Security Policy that allows scripts only by nonce, hash or the program's own origin, with no `unsafe-inline` and no `unsafe-eval`, and sets `object-src 'none'`, `base-uri 'none'` and `frame-ancestors`.

| Why | Check | Tags |
|---|---|---|
| when a script slips into the page anyway, the browser refuses to run it; the policy is the last wall behind every check in the code. | test | [security] |

## trusted-types-required · SHOULD
The Content Security Policy requires Trusted Types for scripts, so a string reaches an HTML or script sink only through a policy the program defines.

| Why | Check | Tags |
|---|---|---|
| the browser then refuses an unchecked string at every sink, in a library or behind a dynamic property no lint can see. | test | [security] |

## documents-sent-with-security-headers · SHOULD
Every document is served with `Strict-Transport-Security` of a year or more, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` or stricter, and `Cross-Origin-Opener-Policy: same-origin`, or `same-origin-allow-popups` where the program opens a window it talks to.

| Why | Check | Tags |
|---|---|---|
| each closes one door the page would leave open: a first request over plain HTTP, a file read as a script, the full address sent to other sites, another window reaching into this one. | test | [security] |

## scripts-from-other-origins-pinned · SHOULD
A script from another origin is served from the program's own origin, or loaded with `integrity` and `crossorigin`; a script that changes by design — a tag manager's container — loads only through a loader the Content Security Policy allows by nonce or hash with `strict-dynamic`, with the reason beside it.

| Why | Check | Tags |
|---|---|---|
| a script on another server changes when that server does; with its hash pinned, the browser refuses a replaced file. | review | [security] |

## bundle-size-budget · SHOULD
Each bundle has a size budget the check holds, the embeddable one first.

| Why | Check | Tags |
|---|---|---|
| size grows one dependency at a time, and only a budget notices the one that crosses the line. | test | [performance] |

