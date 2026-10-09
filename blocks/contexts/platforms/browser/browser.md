---
id: browser
summary: Code that runs in a browser tab.
requires: [untrusted-client]
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Browser

> A program that runs in a browser tab. Its user can read everything it ships, and its network can fail; the rules on screens in a browser are in `with/ui.md`.

### runtime-configuration-served-beside-bundle · MUST
One bundle serves every environment: its configuration is served beside it, and no environment value is baked into the bundle. The compiler gives browser code the browser's globals and no runtime's.

| Why | Tags |
|---|---|
| one tested bundle is promoted from staging to production unchanged, and nothing environment-specific is published inside it. | [security] |

### no-credential-readable-by-script → client-credential-kept-in-the-protected-store · MUST
A credential in the tab lives only in a cookie its script cannot read, never in web storage, IndexedDB or the script's memory: the tab holds no bearer token.

| Why | Tags |
|---|---|
| a cookie the page's script cannot read is the one store of a tab that no script in the page can reach. | [security] |

### cross-window-messages-check-origin → outside-address-followed-only-from-an-allowlist · MUST
A message from another window is accepted only from an expected origin, and parsed; an outgoing message names its target origin.

| Why | Tags |
|---|---|
| any page can post a message to any window; without the origin check, any page can drive the program. | [] |

### redirect-targets-allowlisted → outside-address-followed-only-from-an-allowlist · MUST
A redirect target taken from the address or a form — `returnTo`, `redirect`, `next` — is followed only when it is a path of the program's own or on an allowlist; anything else falls back to the home screen.

| Why | Tags |
|---|---|
| a sign-in link that redirects anywhere sends the user, just signed in and trusting the page, to a lookalike site. | [security] |

### strict-content-security-policy · MUST
Every document is served with a Content Security Policy that allows scripts only by nonce, hash or the program's own origin, with no `unsafe-inline` and no `unsafe-eval`, and sets `object-src 'none'`, `base-uri 'none'` and `frame-ancestors`.

| Why | Tags |
|---|---|
| when a script slips into the page anyway, the browser refuses to run it; the policy is the last wall behind every check in the code. | [security] |

### no-raw-html-injection · MUST
No raw HTML reaches the DOM: no `innerHTML` or `outerHTML` assigned, no `insertAdjacentHTML`, no `document.write`. Untrusted markup goes through a sanitising renderer.

| Why | Tags |
|---|---|
| injected HTML runs whatever script it carries, in the user's session. | [security] |

### trusted-types-required · SHOULD
The Content Security Policy requires Trusted Types for scripts, so a string reaches an HTML or script sink only through a policy the program defines.

| Why | Tags |
|---|---|
| the browser then refuses an unchecked string at every sink, in a library or behind a dynamic property no lint can see. | [security] |

### documents-sent-with-security-headers · SHOULD
Every document is served with `Referrer-Policy: strict-origin-when-cross-origin` or stricter, and `Cross-Origin-Opener-Policy: same-origin`, or `same-origin-allow-popups` where the program opens a window it talks to.

| Why | Tags |
|---|---|
| each closes one door the page would leave open: the full address sent to other sites, another window reaching into this one. | [security] |

### scripts-from-other-origins-pinned · SHOULD
A script from another origin is served from the program's own origin, or loaded with `integrity` and `crossorigin`; a script that changes by design — a tag manager's container — loads only through a loader the Content Security Policy allows by nonce or hash with `strict-dynamic`, with the reason beside it.

| Why | Tags |
|---|---|
| a script on another server changes when that server does; with its hash pinned, the browser refuses a replaced file. | [security] |

### bundle-size-budget · SHOULD
Each bundle has a size budget the check holds.

| Why | Tags |
|---|---|
| size grows one dependency at a time, and only a budget notices the one that crosses the line. | [performance] |

### hashed-assets-immutable-html-revalidated · SHOULD
Hashed assets are served as immutable; the HTML and the runtime configuration are revalidated.

| Why | Tags |
|---|---|
| hashed files never change, so they are cached for good, while what points at them must be fresh. | [performance] |

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST
In the browser, the resources the program shares with its host include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker; each has one writer.

| Why | Tags |
|---|---|
| each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins. | [] |
