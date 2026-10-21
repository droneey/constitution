# Accessibility

> Governs ARIA, labels, ids, autocomplete, roles and zoom in JSX.

## Controls

### labels-bound-with-use-id → every-control-has-an-accessible-name · MUST

A label names its control with `htmlFor`, by the control's id from `useId`.

| Why | Tags |
|---|---|
| a label bound by its control's id names the control to assistive technology wherever the two sit in the markup. | [] |

### jsx-controls-named → every-control-has-an-accessible-name · MUST

A form control has a label, an image its `alt` text, an SVG and an iframe their title, and a link or a button content that names it.

| Why | Tags |
|---|---|
| a screen reader announces a control by its name. | [a11y] |

### known-fields-declare-autocomplete → field-declares-its-autocomplete · MUST

An email, telephone, password or URL input declares `autocomplete`, with a valid token.

| Why | Tags |
|---|---|
| the browser fills these fields only when told what they hold. | [ux] |

### handlers-and-links-on-native-elements → native-html-elements-first · MUST

In JSX, a handler such as `onClick` sits on the native element whose role it needs, never on a `div` or a `span`, and an `<a>` takes a real `href`, never `#` or a `javascript:` address.

| Why | Tags |
|---|---|
| a native element brings its role, its keyboard and its announcement. | [a11y] |

## ARIA and ids

### aria-attributes-as-the-dom-spells-them · MUST

ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.

| Why | Tags |
|---|---|
| a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it. | [a11y] |

### jsx-roles-and-aria-valid → native-semantics-first · MUST

An element's role and ARIA attributes are valid and fit it: no redundant role, no role that makes an interactive element static or a static one interactive, no handler on a non-interactive element, and an interactive element focusable.

| Why | Tags |
|---|---|
| a wrong role or attribute is worse than none. | [a11y] |

### ids-from-use-id → id-unique-in-its-document · MUST

An id comes from `useId`, never typed by hand or random — except the id of an element, never a labelled control, that the root renders once and other code must know, a skip link's target or an SVG's shared `<defs>`, which is a constant with a suppression that says so.

| Why | Tags |
|---|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. | [] |

## Zoom

### jsx-viewport-never-blocks-zoom → viewport-never-blocks-zoom · MUST

A viewport `<meta>` written in JSX never sets `user-scalable=no`.

| Why | Tags |
|---|---|
| this is the part of the rule the linter sees in markup. | [a11y] |
