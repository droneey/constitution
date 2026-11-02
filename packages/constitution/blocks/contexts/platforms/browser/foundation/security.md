# Security

> Governs the document's policies, raw HTML, messages between windows, redirects, and the credentials kept from script.

## Secrets

### credential-never-readable-by-script → client-credential-kept-in-the-protected-store · MUST

A credential in the tab is never readable by its script. It lives only in a cookie the script cannot read, never in web storage, IndexedDB or the script's memory, so the tab holds no bearer token.

| Why |
|---|
| a credential any script in the page can read is taken by the first script injected into it, and a cookie the script cannot read is the one store of a tab out of that script's reach. |

## Input from outside

### raw-html-never-reaches-the-dom → outside-input-reaches-interpreters-as-parameters · MUST

Raw HTML never reaches the DOM. Markup reaches it only through the platform's element APIs or a sanitising renderer — `Element.setHTML()` among them — never as a string assigned to `innerHTML`, `outerHTML` or `srcdoc`, passed to `insertAdjacentHTML`, `setHTMLUnsafe`, `Document.parseHTMLUnsafe`, `DOMParser.parseFromString` or `Range.createContextualFragment`, or written by `document.write` or `document.writeln`.

| Why |
|---|
| a string parsed as markup runs whatever script it carries, in its user's session. |

### cross-window-message-origin-checked → outside-address-followed-only-from-an-allowlist · MUST

A message between windows or frames is accepted only from an expected origin and posted only to a named one. A message the program posts never names `*` as its target origin.

| Why |
|---|
| any page can post a message to any window it holds, and a message posted to `*` is read by whatever page that window now shows. |

### redirect-target-allowlisted → outside-address-followed-only-from-an-allowlist · MUST

A redirect target from outside is followed only to an allowed origin. A target taken from the address or a form — a parameter that names where to go next — is resolved by the URL parser against the program's origin and followed only when the result's origin is the program's own or one on its allowlist; any other target falls back to the home screen.

| Why |
|---|
| a sign-in link that redirects anywhere sends the person, just signed in and trusting the page, to a lookalike site. |

## Document headers

### document-served-with-a-strict-content-security-policy · MUST

Every document is served with a strict Content Security Policy. The policy allows a script only by its nonce or its hash, with `strict-dynamic` for what those scripts load — never by a list of origins, `unsafe-inline` or `unsafe-eval` — and sets `object-src 'none'` and `base-uri 'none'`.

| Why |
|---|
| a script that slips into the page despite every check in the code runs in its user's session unless the browser refuses it, and the policy is the last wall that does — defence in depth. |

### document-framed-only-by-allowed-origins · MUST

Every document is framed only by the origins it allows. Its Content Security Policy sets `frame-ancestors`, to `'none'` or to the origins the program allows to frame it.

| Why |
|---|
| a page another site can frame invisibly is clicked through by people who believe they are clicking that other site — Content Security Policy. |

### content-security-policy-requires-trusted-types · SHOULD

The Content Security Policy requires Trusted Types for scripts. A string reaches an HTML or a script sink only through a policy the program defines.

| Why |
|---|
| without it an unchecked string reaches a sink in a library, or behind a dynamic property no reader of the code can follow, where no review finds it — Trusted Types. |

### content-security-policy-violations-reported · SHOULD

The Content Security Policy's violations are reported. The policy names an endpoint for its reports — `report-to` with a `Reporting-Endpoints` header, and `report-uri` beside it while a browser the program supports lacks `report-to` — and the reports reach the program's diagnostics.

| Why |
|---|
| a policy that only blocks hides both the attack it stopped and the page it broke; a report shows each of them — Content Security Policy. |

### document-served-with-a-same-origin-opener-policy · SHOULD

Every document is served with a same-origin opener policy. It is `Cross-Origin-Opener-Policy: same-origin`, or `same-origin-allow-popups` where the program opens a window it talks to.

| Why |
|---|
| a window of another origin that keeps a handle on this one can navigate it and probe its state. |

### document-served-with-a-permissions-policy · SHOULD

Every document is served with a Permissions Policy that turns off what the program does not use. Its `Permissions-Policy` header names each powerful feature — camera, microphone, geolocation, payment and their kin —, turning off the ones the program does not use and allowing the others only to the origins that need them.

| Why |
|---|
| without it a script that slips into the page, or a frame it embeds, turns on a sensor or a payment the program never asked for — least privilege. |
