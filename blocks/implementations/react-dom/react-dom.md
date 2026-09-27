---
id: react-dom
kind: implementation
summary: React in the browser — the DOM, the document, labels and portals.
chapters: []
requires: [browser]
extends: _react
abstract: false
checks: []
owns: [React DOM]
governs: ["**/*.tsx"]
status: stable
---

# React DOM

> React rendering to the browser's document.

## document-metadata-rendered-by-its-owner · SHOULD
`<title>`, `<meta>` and `<link>` are rendered by the component or route that owns them; no head library, and no effect writing to the document head.
**Why:** React hoists them into the head, so metadata lives beside what it describes.
**Check:** review
**Tags:** ux
**Implements:** `document-metadata-owned-by-screen`

## third-party-script-rendered-as-element · SHOULD
A third-party script is rendered as `<script async src>` where it is needed; no script tag is inserted by hand.
**Why:** React dedupes and orders rendered scripts; a hand-inserted one runs twice or too early.
**Check:** review
**Tags:** performance

## aria-attributes-as-the-dom-spells-them · MUST
ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.
**Why:** a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it.
**Check:** tool — lint
**Tags:** a11y

## labels-bound-with-use-id · SHOULD
A label names its control with `htmlFor`, and the id comes from `useId`, never typed by hand or random.
**Why:** a typed id collides when the component renders twice, and a random one differs between server and client.
**Check:** tool — lint
**Tags:** a11y
**Implements:** `every-control-has-an-accessible-name`

## overlays-rendered-through-portal · SHOULD
An overlay — a dialog, a popover, a toast — renders through a portal.
**Why:** outside the portal, a parent's overflow or stacking context clips it, and focus management breaks.
**Check:** review
**Tags:** a11y, ux

## browser-apis-read-outside-render · SHOULD
Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.
**Why:** read during render, they break server rendering and tear between renders.
**Check:** review
**Tags:** errors
**Implements:** `no-browser-globals-during-render`

## no-raw-html-injection · MUST
No raw HTML is injected; untrusted markup goes through a sanitising renderer.
**Why:** injected HTML runs whatever script it carries, in the user's session.
**Check:** tool — lint
**Tags:** security
**Implements:** `untrusted-input-parsed-at-edge`
