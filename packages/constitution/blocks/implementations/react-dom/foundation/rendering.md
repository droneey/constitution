# Rendering

> Governs what a component renders and reads — overlays, browser APIs, inline styles and raw markup — where its render errors are reported, and who writes the document's head.

## Overlays

### overlay-rendered-in-a-portal-or-the-top-layer · SHOULD

An overlay renders through a portal or in the top layer. That holds for a dialog, a popover or a toast, and the top layer is the one the platform gives a modal `<dialog>` and a `popover`.

| Why |
|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. |

## Browser APIs

### browser-apis-read-outside-render → browser-global-never-read-while-rendering · MUST

Browser APIs are never read during render. They are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot.

| Why |
|---|
| read during render, they break server rendering and tear between renders. |

## Styles and markup

### inline-style-only-custom-properties-and-geometry → tokens-single-source-of-appearance · MUST

An element's inline `style` holds only custom properties. It is an object literal of custom properties; geometry a positioning library computes is the one other inline value, and its suppression says so.

| Why |
|---|
| an inline visual value sits outside the tokens, where no theme and no mode reaches it, while a custom property only passes data to the stylesheet that styles it. |

### dangerously-set-inner-html-never-used → raw-html-never-reaches-the-dom · MUST

`dangerouslySetInnerHTML` is never set.

| Why |
|---|
| it writes a string into the DOM as markup, past React's escaping, so a script hidden in the string runs in the user's page. |

## Render errors

### render-errors-reported-at-the-root → failure-logged-once · SHOULD

Render errors are reported once, at the root. The root's `onUncaughtError`, `onCaughtError` and `onRecoverableError` report them; a boundary renders the failure and reports nothing.

| Why |
|---|
| a boundary that also reports makes one render error look like two, and one it misses goes unreported; the root sees every render error, the ones a boundary catches included. |

## Head

### one-writer-of-the-head → browser-resources-have-one-writer · MUST

React's rendering is the one writer of the document's head. Where no other active block claims the head, `<title>`, `<meta>` and `<link>` reach it only as rendered elements React hoists, never through a library that writes the head itself or an effect that writes to it, and no script tag is inserted by hand, save by the one module that wraps a third-party service, which appends its script once to the body.

| Why |
|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other; a hand-inserted script runs twice or too early, unless the one module that wraps its service appends it once to the body, which leaves the head to React. |
