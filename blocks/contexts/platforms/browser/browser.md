---
id: browser
kind: context
summary: Code that runs in a browser tab.
chapters: []
requires: [untrusted-client, unreliable-network]
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Browser

> A program that runs in a browser tab. Its user can read everything it ships, and its network can fail; the rules on screens in a browser are in `with/ui.md` and `with/a11y.md`.

## server-rendering-is-delivery-only · MUST
The program's logic runs in the tab. Server rendering, when it is on, only speeds the first paint: no business logic, no data access and no server function lives on the web tier.
**Why:** a web tier with logic of its own is a second backend nobody designed, with its own secrets and failures.
**Check:** review
**Tags:** architecture

## no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.
**Why:** on the server the global does not exist, and the render fails or differs from the one in the tab.
**Check:** review
**Tags:** errors

## runtime-configuration-served-beside-bundle · MUST
One bundle serves every environment: its configuration is served beside it and read once, at boot, by the configuration provider. No environment value is baked into the bundle.
**Why:** one tested bundle is promoted from staging to production unchanged, and nothing environment-specific is published inside it.
**Check:** review
**Tags:** security, architecture
**Implements:** `environment-read-once-at-boot`

## bundle-size-budget · SHOULD
Each bundle has a size budget the check holds, the embeddable one first.
**Why:** size grows one dependency at a time, and only a budget notices the one that crosses the line.
**Check:** test
**Tags:** performance

## cross-window-messages-check-origin · MUST
A message from another window is accepted only from an expected origin, and parsed; an outgoing message names its target origin.
**Why:** any page can post a message to any window; without the origin check, any page can drive the program.
**Check:** review
**Tags:** security
**Implements:** `untrusted-input-parsed-at-edge`
