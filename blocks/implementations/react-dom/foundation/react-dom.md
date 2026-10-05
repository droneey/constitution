# React DOM

## no-dangerously-set-inner-html → no-raw-html-injection
`dangerouslySetInnerHTML` is never set.

| Why | Check | Tags |
|---|---|---|
| it writes a string into the DOM as markup, past React's escaping. | tool/lint | [] |

## one-writer-of-the-head → one-writer-per-shared-resource
Unless another active block claims the document's head, React's hoisted elements are its one writer: no head library, no effect writing to the document head, and no script tag inserted by hand.

| Why | Check | Tags |
|---|---|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other; a hand-inserted script runs twice or too early. | review | [ux] |

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

## Accessibility

## labels-bound-with-use-id → every-control-has-an-accessible-name
A label names its control with `htmlFor`, by the control's id from `useId`.

| Why | Check | Tags |
|---|---|---|
| a label bound by its control's id names the control to assistive technology wherever the two sit in the markup. | review | [] |

## ids-from-use-id · MUST
An id comes from `useId`, never typed by hand or random — except the id of an element, never a labelled control, that the root renders once and other code must know, a skip link's target or an SVG's shared `<defs>`, which is a constant with a suppression that says so.

| Why | Check | Tags |
|---|---|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. | tool/lint | [] |

## known-fields-declare-autocomplete → fields-declare-autocomplete
An email, telephone, password or URL input declares `autocomplete`, with a valid token.

| Why | Check | Tags |
|---|---|---|
| the browser fills these fields only when told what they hold. | tool/lint | [ux] |

## handlers-and-links-on-native-elements → native-html-elements-first
In JSX, a handler such as `onClick` sits on the native element whose role it needs, never on a `div` or a `span`, and an `<a>` takes a real `href`, never `#` or a `javascript:` address.

| Why | Check | Tags |
|---|---|---|
| a native element brings its role, its keyboard and its announcement. | tool/lint | [a11y] |

## jsx-controls-named → every-control-has-an-accessible-name
A form control has a label, an image its `alt` text, an SVG and an iframe their title, and a link or a button content that names it.

| Why | Check | Tags |
|---|---|---|
| a screen reader announces a control by its name. | tool/lint | [a11y] |

## jsx-roles-and-aria-valid → native-semantics-first
An element's role and ARIA attributes are valid and fit it: no redundant role, no role that makes an interactive element static or a static one interactive, no handler on a non-interactive element, an interactive element focusable, and no `aria-hidden` on a focusable one.

| Why | Check | Tags |
|---|---|---|
| a wrong role or attribute is worse than none. | tool/lint | [a11y] |

## jsx-viewport-never-blocks-zoom → viewport-never-blocks-zoom
A viewport `<meta>` written in JSX never sets `user-scalable=no`.

| Why | Check | Tags |
|---|---|---|
| this is the part of the rule the linter sees in markup. | tool/lint | [a11y] |
