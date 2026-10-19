# Rendering

> Governs what a component renders and reads — overlays, browser APIs, inline styles, images and raw markup — where its render errors are reported, and who writes the document's head.

## General

### overlays-rendered-through-portal · SHOULD

An overlay — a dialog, a popover, a toast — renders through a portal, or in the top layer the platform gives a modal `<dialog>` and a `popover`.

| Why | Tags |
|---|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. | [a11y, ux] |

### browser-apis-read-outside-render → browser-global-never-read-while-rendering · MUST

Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.

| Why | Tags |
|---|---|
| read during render, they break server rendering and tear between renders. | [] |

### inline-style-only-custom-properties-and-geometry → tokens-single-source-of-appearance · MUST

An element's inline `style` is an object literal of custom properties only; geometry a positioning library computes is the one other inline value, and its suppression says so.

| Why | Tags |
|---|---|
| an inline visual value is a value written outside the tokens, while a custom property passes data to the stylesheet that styles it. | [ux] |

### jsx-images-declare-their-size → image-declares-its-size · SHOULD

An `<img>` written in JSX declares `width` and `height`.

| Why | Tags |
|---|---|
| this is the form of the rule the linter sees in markup. | [performance] |

### dangerously-set-inner-html-never-used → raw-html-never-reaches-the-dom · MUST

`dangerouslySetInnerHTML` is never set.

| Why | Tags |
|---|---|
| it writes a string into the DOM as markup, past React's escaping. | [] |

## Render errors

### render-errors-reported-at-the-root → failure-logged-once · SHOULD

Render errors are reported once, through the root's `onUncaughtError`, `onCaughtError` and `onRecoverableError`; a boundary renders the failure and reports nothing.

| Why | Tags |
|---|---|
| the root sees every render error, the ones a boundary catches included, so each is reported once. | [] |

## Head

### one-writer-of-the-head → browser-resources-have-one-writer · MUST

Unless another active block claims the document's head, React's hoisted elements are its one writer: no head library, no effect writing to the document head, and no script tag inserted by hand, save by the one module that wraps a third-party service, which appends its script once to the body.

| Why | Tags |
|---|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other; a hand-inserted script runs twice or too early, unless the one module that wraps its service appends it once to the body, which leaves the head to React. | [ux] |
