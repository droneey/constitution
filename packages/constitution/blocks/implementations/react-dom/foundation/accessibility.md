# Accessibility

> Governs ARIA, labels, ids and roles in JSX.

## Controls

### labels-bound-with-use-id → every-control-has-an-accessible-name · MUST

A label names its control with `htmlFor`, by the control's id from `useId`.

| Why |
|---|
| a label bound by its control's id names the control to assistive technology wherever the two sit in the markup. |

## ARIA and ids

### aria-attributes-as-the-dom-spells-them · MUST

ARIA attributes are written hyphenated, as the DOM spells them; the camelCase form is forbidden.

| Why |
|---|
| a camelCase ARIA prop is not an attribute the browser knows, so assistive technology never sees it. |

### jsx-roles-and-aria-valid → native-semantics-first · MUST

An element's role and ARIA attributes are valid and fit it: no redundant role, no role that makes an interactive element static or a static one interactive, no handler on a non-interactive element, and an interactive element focusable.

| Why |
|---|
| a wrong role or attribute is worse than none. |

### ids-from-use-id → id-unique-in-its-document · MUST

An id comes from `useId`, never typed by hand or random — except the id of an element, never a labelled control, that the root renders once and other code must know, a skip link's target or an SVG's shared `<defs>`, which is a constant with a suppression that says so.

| Why |
|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. |
