# Browser

## no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.

| Why | Check | Tags |
|---|---|---|
| on the server the global does not exist, and the render fails or differs from the one in the tab. | review | [errors] |

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

## no-credential-readable-by-script · MUST
A credential in the tab lives only in a cookie its script cannot read — `HttpOnly`, `Secure`, `SameSite`, named with the `__Host-` prefix — never in web storage, IndexedDB or a variable that outlives a request.

| Why | Check | Tags |
|---|---|---|
| any script that runs in the page — injected, or a compromised dependency — reads what the page's script can read and sends it away. | review | [security] |

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

## bundle-size-budget · SHOULD
Each bundle has a size budget the check holds, the embeddable one first.

| Why | Check | Tags |
|---|---|---|
| size grows one dependency at a time, and only a budget notices the one that crosses the line. | test | [performance] |

## core-web-vitals-within-budget · SHOULD
Largest Contentful Paint stays within 2.5 s, Interaction to Next Paint within 200 ms and Cumulative Layout Shift within 0.1 at the 75th percentile, measured in the field.

| Why | Check | Tags |
|---|---|---|
| these are what users feel of speed; a bundle budget is only a proxy for them. | review | [performance, ux] |
