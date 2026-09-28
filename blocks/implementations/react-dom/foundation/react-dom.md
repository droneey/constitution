# React DOM

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
