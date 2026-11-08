# Security

> Governs the credentials a tab keeps from its script, markup built from strings, messages between windows, redirects and the policies a document is served with.

## Vocabulary

A document's **CSP** is the policy its `Content-Security-Policy` header declares.

## Secrets

### credential-never-readable-by-script · MUST

No bearer token reaches the tab's script, not even in the memory of its page. Exempt: a tab whose program has no server of its own, which holds the token only in the memory of its page and never stores it.

| Why |
|---|
| a tab's script reads every store the tab gives it, its page's memory included, so a bearer token is safe from that script only on the program's server, and a token any script in the page can read is taken by the first script injected into it and opens the API to whoever runs that script. |

## Input from outside

### raw-html-never-reaches-the-dom → outside-input-reaches-interpreters-as-parameters · MUST

No string reaches the DOM as raw markup. Markup reaches it only through the platform's element APIs, `Element.setHTML()` among them, or as `TrustedHTML` that a sanitiser returns, never as a string assigned to `innerHTML`, `outerHTML` or `srcdoc`, passed to `insertAdjacentHTML`, `setHTMLUnsafe`, `Document.parseHTMLUnsafe`, `DOMParser.parseFromString` or `Range.createContextualFragment`, or written by `document.write` or `document.writeln`.

| Why |
|---|
| a string parsed as markup runs whatever script it carries, in its user's session, once its nodes reach the page, and a string that is constant today is joined with outside input by a later change no review ties to it, so the rule bars every string and not only one built from outside input. |

### cross-window-message-origin-checked → outside-address-followed-only-from-an-allowlist · MUST

Every message from another window or frame is accepted only from an origin the program allows.

| Why |
|---|
| any page can post a message to any window it holds, so a handler that reads every message acts on whatever a hostile page sends it. |

### cross-window-message-posted-to-a-named-origin · MUST

Every message the program posts to another window or frame names its target origin, never `*`.

| Why |
|---|
| a message posted to `*` is read by whatever page that window now shows. |

### redirect-target-checked-by-its-resolved-origin → outside-address-followed-only-from-an-allowlist · MUST

Every redirect target from outside is checked by the origin it resolves to, never by its text. The URL parser resolves it against the program's origin, and such targets include a parameter of the address or of a form that names where to go next.

| Why |
|---|
| a target checked by its text passes a check that its resolved origin fails, such as a protocol-relative address, so a sign-in link sends the person, just signed in and trusting the page, to a lookalike site. |

## Document headers

### document-served-with-a-strict-content-security-policy · MUST

Every document is served with a CSP that allows a script only by its nonce, its hash or `strict-dynamic`. `strict-dynamic` passes the trust of the scripts so allowed on to the scripts they load, and no script is allowed by a list of origins or by `unsafe-inline`.

| Why |
|---|
| a script that slips into the page despite every check in the code runs in its user's session unless the browser refuses it, and the policy is the last wall that does — defence in depth. |

### content-security-policy-refuses-eval · MUST

Every document's CSP leaves out `unsafe-eval`.

| Why |
|---|
| `unsafe-eval` lets a string run as script through `eval`, `Function` or a timer given a string, so text an attacker slips into such a call runs in its user's session past every nonce the policy checks. |

### content-security-policy-turns-off-plugins · MUST

Every document's CSP sets `object-src 'none'`.

| Why |
|---|
| an injected `<object>` or `<embed>` runs a plugin's code, which the policy's rule for scripts never sees, in its user's session. |

### content-security-policy-fixes-the-base-address · MUST

Every document's CSP sets `base-uri 'none'`, or `base-uri 'self'` where the document holds a `<base>` of its own.

| Why |
|---|
| an injected `<base>` element moves every relative address to another server, so a script the nonce allows loads from there. |

### document-framed-only-by-allowed-origins · MUST

Every document is framed only by the origins it allows. Its CSP sets `frame-ancestors` to `'none'` or to the origins the program allows to frame it.

| Why |
|---|
| a page another site can frame invisibly is clicked through by people who believe they are clicking that other site — CSP Level 3. |

### content-security-policy-requires-trusted-types · MUST

Every document's CSP requires Trusted Types for scripts, by `require-trusted-types-for 'script'`.

| Why |
|---|
| without it an unchecked string reaches a sink in a library, or behind a dynamic property no reader of the code can follow, where no review finds it — Trusted Types. |

### content-security-policy-violations-reported · SHOULD

Every document's CSP reports its violations to the program's diagnostics. The policy names an endpoint by `report-to` with a `Reporting-Endpoints` header, and by `report-uri` beside it while a browser the program supports lacks `report-to`.

| Why |
|---|
| a policy that only blocks hides both the attack it stopped and the page it broke, while a report shows each of them — CSP Level 3. |

### document-served-with-a-same-origin-opener-policy · MUST

Every document is served with a same-origin opener policy. It is `Cross-Origin-Opener-Policy: same-origin`, or `same-origin-allow-popups` where the program opens a window it talks to.

| Why |
|---|
| a window of another origin that keeps a handle on this one can navigate it and probe its state. |

### document-served-with-a-permissions-policy · MUST

Every document is served with a Permissions Policy that allows each powerful feature only to the origins that use it. Its `Permissions-Policy` header names each such feature, such as the camera, the microphone, geolocation and payment, so a feature no origin uses is allowed to none.

| Why |
|---|
| without it a script that slips into the page, or a frame it embeds, turns on a sensor or a payment the program never asked for — least privilege. |
