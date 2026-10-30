# Rendering

> Governs what a component renders and reads — overlays, browser APIs, inline styles and raw markup — where its render errors are reported, and who writes the document's head.

## General

### overlays-rendered-through-portal · SHOULD

An overlay — a dialog, a popover, a toast — renders through a portal, or in the top layer the platform gives a modal `<dialog>` and a `popover`.

| Why |
|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. |

### browser-apis-read-outside-render → browser-global-never-read-while-rendering · MUST

Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.

| Why |
|---|
| read during render, they break server rendering and tear between renders. |

### inline-style-only-custom-properties-and-geometry → tokens-single-source-of-appearance · MUST

An element's inline `style` is an object literal of custom properties only; geometry a positioning library computes is the one other inline value, and its suppression says so.

| Why |
|---|
| an inline visual value is a value written outside the tokens, while a custom property passes data to the stylesheet that styles it. |

### dangerously-set-inner-html-never-used → raw-html-never-reaches-the-dom · MUST

`dangerouslySetInnerHTML` is never set.

| Why |
|---|
| it writes a string into the DOM as markup, past React's escaping. |

## Render errors

### render-errors-reported-at-the-root → failure-logged-once · SHOULD

Render errors are reported once, through the root's `onUncaughtError`, `onCaughtError` and `onRecoverableError`; a boundary renders the failure and reports nothing.

| Why |
|---|
| the root sees every render error, the ones a boundary catches included, so each is reported once. |

## Head

### one-writer-of-the-head → browser-resources-have-one-writer · MUST

React's rendering is the one writer of the document's head: `<title>`, `<meta>` and `<link>` reach it only as rendered elements React hoists, never through a library that writes the head itself or an effect that writes to it.

| Why |
|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other. |
