---
id: browser
summary: Delivery, defences, storage and lifecycle of code in a browser tab.
requires: [untrusted-client]
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Browser

> A program that runs in a browser tab, on a device its user controls. It is downloaded as a bundle with its configuration served beside it, lives in a document the browser can hide, freeze, restore and close at any moment, and keeps in the tab's storage only what the browser lets it keep; its user can read everything it ships. How its screens use the document is in `with/ui.md`, and what a program rendered first on its own server adds is in `with/server.md`.

## Code

### bundle-within-its-size-budget · SHOULD

Each bundle the tab loads stays within a size budget the project sets for it, and a build that exceeds the budget fails.

| Why | Tags |
|---|---|
| size grows one dependency at a time, and only a budget notices the change that crosses the line before people on slow networks and devices do. | [performance] |

### hashed-file-immutable-and-its-pointers-revalidated · SHOULD

A file whose name carries the hash of its content is served as `immutable`, and a file that points at others by name — the document, the runtime configuration, the service worker's script — is revalidated on every use.

| Why | Tags |
|---|---|
| a hashed file never changes, so it is kept for good, while the file that names it must be fresh, or the tab loads a release that no longer exists. | [performance] |

## Effects

### runtime-configuration-served-beside-bundle → one-artefact-serves-every-environment · MUST

One bundle serves every environment: a setting that differs between environments is served beside the bundle, never built into it.

| Why | Tags |
|---|---|
| one tested bundle is promoted from staging to production unchanged, and nothing that belongs to one environment ships inside it. | [security] |

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST

In the browser, the resources the program shares with its host include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker; each has one writer.

| Why | Tags |
|---|---|
| each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins. | [] |

### service-worker-update-waits-for-the-page · SHOULD

A new service worker takes control of a page already open only at the page's next navigation, or after its user accepts a reload the page offers.

| Why | Tags |
|---|---|
| a page whose worker changes under it fetches files of a release its code does not know, and a reload nobody asked for loses what its user was typing. | [ux, errors] |

### service-worker-caches-versioned → kept-collection-bounded · MUST

Each cache a service worker fills is named by its version, and a worker that activates deletes the caches of every older version.

| Why | Tags |
|---|---|
| caches left by old versions only grow, fill the origin's quota and push out the data the program still needs. | [performance] |

### tab-only-data-kept-in-persistent-storage · SHOULD

Data that exists nowhere but in the tab — an offline draft, a queued write — is kept only in storage the program has asked the browser to persist, by `navigator.storage.persist()` when its user first saves such data.

| Why | Tags |
|---|---|
| a browser short of space evicts the storage it was not asked to keep, and data held nowhere else is then lost without a trace. | [data] |

### page-exit-work-runs-when-the-page-hides · MUST

Work a page does as it is left — saving its state, sending a last report — runs when `visibilitychange` reports `hidden` or on `pagehide`, never in an `unload` handler.

| Why | Tags |
|---|---|
| browsers no longer fire `unload` reliably, and a page that listens for it is kept out of the back/forward cache, so its last work is lost and the way back is slow. | [data, performance] |

## Security

### document-served-with-a-strict-content-security-policy · MUST

Every document is served with a Content Security Policy that allows a script only by its nonce or its hash, with `strict-dynamic` for what those scripts load — never by a list of origins, `unsafe-inline` or `unsafe-eval` — and sets `object-src 'none'` and `base-uri 'none'`.

| Why | Tags |
|---|---|
| when a script slips into the page despite every check in the code, the browser refuses to run it; the policy is the last wall. | [security] |

### document-framed-only-by-allowed-origins · MUST

Every document's Content Security Policy sets `frame-ancestors`, to `'none'` or to the origins the program allows to frame it.

| Why | Tags |
|---|---|
| a page another site can frame invisibly is clicked through by people who believe they are clicking that other site. | [security] |

### content-security-policy-requires-trusted-types · SHOULD

The Content Security Policy requires Trusted Types for scripts, so a string reaches an HTML or a script sink only through a policy the program defines.

| Why | Tags |
|---|---|
| the browser then refuses an unchecked string at every sink, in a library or behind a dynamic property no reader of the code can follow. | [security] |

### content-security-policy-violations-reported · SHOULD

The Content Security Policy names an endpoint for its violation reports — `report-to` with a `Reporting-Endpoints` header, and `report-uri` beside it while a browser the program supports lacks `report-to` — and the reports reach the program's diagnostics.

| Why | Tags |
|---|---|
| a policy that only blocks hides both the attack it stopped and the page it broke; a report shows each of them. | [security, errors] |

### document-served-with-a-strict-referrer-policy · SHOULD

Every document is served with `Referrer-Policy: strict-origin-when-cross-origin` or a stricter one.

| Why | Tags |
|---|---|
| a full address sent to other sites carries the paths and parameters of the person's session to whoever they link to. | [security, data] |

### document-served-with-a-same-origin-opener-policy · SHOULD

Every document is served with `Cross-Origin-Opener-Policy: same-origin`, or `same-origin-allow-popups` where the program opens a window it talks to.

| Why | Tags |
|---|---|
| a window of another origin that keeps a handle on this one can navigate it and probe its state. | [security] |

### document-served-with-a-permissions-policy · SHOULD

Every document is served with a `Permissions-Policy` that disables each powerful feature the program does not use — camera, microphone, geolocation, payment and their kin — and allows each one it uses only to the origins that need it.

| Why | Tags |
|---|---|
| a script that slips into the page, or a frame it embeds, then cannot turn on a sensor or a payment the program never asked for. | [security, data] |

### raw-html-never-reaches-the-dom → outside-input-reaches-interpreters-as-parameters · MUST

Markup reaches the DOM only through the platform's element interfaces or a sanitising renderer — `Element.setHTML()` among them — never as a string assigned to `innerHTML`, `outerHTML` or `srcdoc`, passed to `insertAdjacentHTML`, `setHTMLUnsafe`, `Document.parseHTMLUnsafe`, `DOMParser.parseFromString` or `Range.createContextualFragment`, or written by `document.write` or `document.writeln`.

| Why | Tags |
|---|---|
| a string parsed as markup runs whatever script it carries, in its user's session. | [security] |

### cross-window-message-origin-checked → outside-address-followed-only-from-an-allowlist · MUST

A message from another window or frame is accepted only from an origin the program expects, and a message the program posts names its target origin, never `*`.

| Why | Tags |
|---|---|
| any page can post a message to any window it holds, and a message posted to `*` is read by whatever page that window now shows. | [security] |

### redirect-target-allowlisted → outside-address-followed-only-from-an-allowlist · MUST

A redirect target taken from the address or a form — `returnTo`, `next` — is resolved by the URL parser against the program's origin and followed only when the result's origin is the program's own or one on its allowlist; any other target falls back to the home screen.

| Why | Tags |
|---|---|
| a sign-in link that redirects anywhere sends the person, just signed in and trusting the page, to a lookalike site. | [security] |

## Dependencies

### script-from-another-origin-pinned · SHOULD

A script from another origin is served from the program's own origin, or loaded with `integrity` and `crossorigin`; a script that changes by design, such as a tag manager's container, loads only through a loader the Content Security Policy allows by nonce or hash with `strict-dynamic`, with the reason beside it.

| Why | Tags |
|---|---|
| a script on another server changes when that server does; with its hash pinned, the browser refuses a replaced file. | [security] |

### supported-browsers-declared-as-a-baseline-target · SHOULD

The browsers the program supports are declared once, as a Baseline target — Baseline widely available or a Baseline year — and the build, the checks and the polyfills read that one declaration.

| Why | Tags |
|---|---|
| a target named by Baseline moves with the web platform instead of a list of versions nobody updates, and one declaration keeps the build and the checks from supporting different browsers. | [ux] |

### feature-beyond-the-target-detected-first · SHOULD

A feature of the web platform the declared target does not cover is used only behind a check that the browser has it, with a fallback or a polyfill the entry file loads.

| Why | Tags |
|---|---|
| a browser the program supports but that lacks the feature would otherwise break the screen that uses it. | [ux, errors] |

## Untrusted client

### credential-never-readable-by-script → client-credential-kept-in-the-protected-store · MUST

A credential in the tab lives only in a cookie its script cannot read, never in web storage, IndexedDB or the script's memory, so the tab holds no bearer token; where the API takes bearer tokens, a server of the program's own holds them behind the cookie.

| Why | Tags |
|---|---|
| a cookie the page's script cannot read is the one store of a tab that no script in the page, injected or not, can reach. | [security] |
