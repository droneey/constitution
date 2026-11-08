# Rendering

> Governs what a component renders and reads — overlays, browser globals, inline styles and raw markup — where its render errors go, and who writes the document's head.

## Overlays

### overlay-never-clipped-by-an-ancestor · MUST

No overlay is clipped by an ancestor's overflow or stacking context. A dialog, a popover or a toast renders through a portal or in the top layer, the layer the platform gives a modal `<dialog>` and a `popover`.

| Why |
|---|
| an overlay rendered inside its parent is cut off by the parent's overflow or hidden under a sibling's stacking context, and focus management breaks around it. |

## Browser globals

### browser-global-read-by-effect-or-external-store → browser-global-never-read-while-rendering · MUST

Every browser global a component renders from is read in a hook's effect or through `useSyncExternalStore` with a server snapshot.

| Why |
|---|
| read during render, a global breaks server rendering and tears between renders, while an effect reads it once the component is in the tab and an external store with a server snapshot gives the server a value of its own. |

## Styles and markup

### inline-style-holds-only-custom-properties → tokens-single-source-of-appearance · MUST

Every element's inline `style` holds only custom properties, as an object literal. Exempt: geometry a positioning library computes, under a suppression that says so.

| Why |
|---|
| an inline visual value sits outside the tokens, where no theme and no mode reaches it, while a custom property only passes data to the styles that use it. |

### dangerously-set-inner-html-never-used → raw-html-never-reaches-the-dom · MUST

`dangerouslySetInnerHTML` is never set.

| Why |
|---|
| it writes a string into the DOM as markup, past React's escaping, so a script hidden in the string runs in the user's page. |

## Render errors

### render-errors-reported-at-the-root → last-resort-handler-one-per-interface · MUST

Every render error reaches the root's handlers, and only them. The root's `onUncaughtError`, `onCaughtError` and `onRecoverableError` take each, and a boundary renders the failure and reports nothing itself.

| Why |
|---|
| a boundary that also reports makes one render error look like two, and one it misses goes unreported; the root sees every render error, the ones a boundary catches included. |

## Head

### head-written-by-hoisted-elements → browser-resources-have-one-writer · MUST

Wherever no other active block gives the document's head another writer, `<title>`, `<meta>` and `<link>` reach it only as elements React hoists. Neither a library that writes the head itself nor an effect writes to it.

| Why |
|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other on every render. |
