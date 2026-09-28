# React DOM

## third-party-script-rendered-as-element · SHOULD
A third-party script is rendered as `<script async src>` where it is needed; no script tag is inserted by hand.

| Why | Check | Tags |
|---|---|---|
| React dedupes and orders rendered scripts; a hand-inserted one runs twice or too early. | review | [performance] |

## document-metadata-rendered-by-its-owner · SHOULD
`<title>`, `<meta>` and `<link>` are rendered as elements, which React hoists into the head; no head library, and no effect writing to the document head.

| Why | Check | Tags |
|---|---|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other. | review | [ux] |

## aria-attributes-as-the-dom-spells-them · MUST
ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.

| Why | Check | Tags |
|---|---|---|
| a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it. | tool — lint | [a11y] |

## labels-bound-with-use-id → every-control-has-an-accessible-name
A label names its control with `htmlFor`, and the id comes from `useId`, never typed by hand or random.

| Why | Check | Tags |
|---|---|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. | tool — lint | [] |

## overlays-rendered-through-portal · SHOULD
An overlay — a dialog, a popover, a toast — renders through a portal.

| Why | Check | Tags |
|---|---|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. | review | [a11y, ux] |

## browser-apis-read-outside-render → no-browser-globals-during-render
Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.

| Why | Check | Tags |
|---|---|---|
| read during render, they break server rendering and tear between renders. | review | [] |
