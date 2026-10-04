# React DOM

## one-writer-of-the-head → one-writer-per-shared-resource
Unless another active block claims the document's head, React's hoisted elements are its one writer: no head library, and no effect writing to the document head.

| Why | Check | Tags |
|---|---|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other. | review | [ux] |

## aria-attributes-as-the-dom-spells-them · MUST
ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.

| Why | Check | Tags |
|---|---|---|
| a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it. | tool/lint | [a11y] |

## overlays-rendered-through-portal · SHOULD
An overlay — a dialog, a popover, a toast — renders through a portal, or in the top layer the platform gives a modal `<dialog>` and a `popover`.

| Why | Check | Tags |
|---|---|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. | review | [a11y, ux] |

## browser-apis-read-outside-render → no-browser-globals-during-render
Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.

| Why | Check | Tags |
|---|---|---|
| read during render, they break server rendering and tear between renders. | review | [] |

## no-inline-style → tokens-single-source-of-appearance
An element's inline `style` is an object literal of custom properties only; geometry a positioning library computes is the one other inline value, and its suppression says so.

| Why | Check | Tags |
|---|---|---|
| an inline visual value is a value written outside the tokens, while a custom property passes data to the stylesheet that styles it. | tool/lint | [ux] |

## render-errors-reported-at-the-root → error-logged-once
Render errors are reported once, through the root's `onUncaughtError`, `onCaughtError` and `onRecoverableError`; a boundary renders the failure and reports nothing.

| Why | Check | Tags |
|---|---|---|
| the root sees every render error, the ones a boundary catches included, so each is reported once. | review | [] |

## jsx-images-declare-their-size → images-declare-their-size
An `<img>` written in JSX declares `width` and `height`.

| Why | Check | Tags |
|---|---|---|
| this is the form of the rule the linter sees in markup. | tool/lint | [performance] |
