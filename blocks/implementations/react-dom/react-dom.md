---
id: react-dom
summary: React in the browser — the DOM, the document, labels and portals.
requires: [browser]
extends: _react
abstract: false
languages: []
dictionary: [React DOM]
governs: ["**/*.tsx"]
---

# React DOM

> React rendering to the browser's document.

### no-dangerously-set-inner-html → no-raw-html-injection · MUST
`dangerouslySetInnerHTML` is never set.

| Why | Tags |
|---|---|
| it writes a string into the DOM as markup, past React's escaping. | [] |

### one-writer-of-the-head → browser-resources-have-one-writer · MUST
Unless another active block claims the document's head, React's hoisted elements are its one writer: no head library, no effect writing to the document head, and no script tag inserted by hand.

| Why | Tags |
|---|---|
| a library or an effect is a second writer of the head, and it and React overwrite each other; a hand-inserted script runs twice or too early. | [ux] |

### aria-attributes-as-the-dom-spells-them · MUST
ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.

| Why | Tags |
|---|---|
| a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it. | [a11y] |

### overlays-rendered-through-portal · SHOULD
An overlay — a dialog, a popover, a toast — renders through a portal, or in the top layer the platform gives a modal `<dialog>` and a `popover`.

| Why | Tags |
|---|---|
| outside the portal, a parent's overflow or stacking context clips it, and focus management breaks. | [a11y, ux] |

### browser-apis-read-outside-render → no-browser-globals-during-render · MUST
Browser APIs are read in a hook's effect, or through `useSyncExternalStore` with a server snapshot, never during render.

| Why | Tags |
|---|---|
| read during render, they break server rendering and tear between renders. | [] |

### inline-style-only-custom-properties-and-geometry → tokens-single-source-of-appearance · MUST
An element's inline `style` is an object literal of custom properties only; geometry a positioning library computes is the one other inline value, and its suppression says so.

| Why | Tags |
|---|---|
| an inline visual value is a value written outside the tokens, while a custom property passes data to the stylesheet that styles it. | [ux] |

### render-errors-reported-at-the-root → failure-logged-once · SHOULD
Render errors are reported once, through the root's `onUncaughtError`, `onCaughtError` and `onRecoverableError`; a boundary renders the failure and reports nothing.

| Why | Tags |
|---|---|
| the root sees every render error, the ones a boundary catches included, so each is reported once. | [] |

### jsx-images-declare-their-size → images-declare-their-size · SHOULD
An `<img>` written in JSX declares `width` and `height`.

| Why | Tags |
|---|---|
| this is the form of the rule the linter sees in markup. | [performance] |

## Accessibility

### labels-bound-with-use-id → every-control-has-an-accessible-name · MUST
A label names its control with `htmlFor`, by the control's id from `useId`.

| Why | Tags |
|---|---|
| a label bound by its control's id names the control to assistive technology wherever the two sit in the markup. | [] |

### ids-from-use-id · MUST
An id comes from `useId`, never typed by hand or random — except the id of an element, never a labelled control, that the root renders once and other code must know, a skip link's target or an SVG's shared `<defs>`, which is a constant with a suppression that says so.

| Why | Tags |
|---|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. | [] |

### known-fields-declare-autocomplete → fields-declare-autocomplete · MUST
An email, telephone, password or URL input declares `autocomplete`, with a valid token.

| Why | Tags |
|---|---|
| the browser fills these fields only when told what they hold. | [ux] |

### handlers-and-links-on-native-elements → native-html-elements-first · MUST
In JSX, a handler such as `onClick` sits on the native element whose role it needs, never on a `div` or a `span`, and an `<a>` takes a real `href`, never `#` or a `javascript:` address.

| Why | Tags |
|---|---|
| a native element brings its role, its keyboard and its announcement. | [a11y] |

### jsx-controls-named → every-control-has-an-accessible-name · MUST
A form control has a label, an image its `alt` text, an SVG and an iframe their title, and a link or a button content that names it.

| Why | Tags |
|---|---|
| a screen reader announces a control by its name. | [a11y] |

### jsx-roles-and-aria-valid → native-semantics-first · MUST
An element's role and ARIA attributes are valid and fit it: no redundant role, no role that makes an interactive element static or a static one interactive, no handler on a non-interactive element, an interactive element focusable, and no `aria-hidden` on a focusable one.

| Why | Tags |
|---|---|
| a wrong role or attribute is worse than none. | [a11y] |

### jsx-viewport-never-blocks-zoom → viewport-never-blocks-zoom · MUST
A viewport `<meta>` written in JSX never sets `user-scalable=no`.

| Why | Tags |
|---|---|
| this is the part of the rule the linter sees in markup. | [a11y] |
