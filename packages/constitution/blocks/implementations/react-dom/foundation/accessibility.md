# Accessibility

> Governs ARIA, labels, ids and roles in JSX.

## Controls

### labels-bound-with-use-id → every-control-has-an-accessible-name · MUST

A label names its control with `htmlFor`, by the control's id from `useId`.

| Why |
|---|
| a label not bound to its control by id names it only while it wraps it, so a control moved out of its label reaches assistive technology without its name — WCAG 2.2, Name, Role, Value. |

## ARIA and ids

### jsx-roles-and-aria-valid → native-semantics-first · MUST

An element's role and ARIA attributes are valid and fit it. Its ARIA attributes are written hyphenated, as the DOM spells them, never in camelCase; it carries no redundant role, no role that makes an interactive element static or a static one interactive, and no handler on a non-interactive element, and an interactive element is focusable.

| Why |
|---|
| a camelCase ARIA prop is no attribute the browser knows, so assistive technology never sees it, and a wrong role or attribute tells it the element is something it is not, so a person is told to use it in a way it does not answer, which is worse than no role at all — WAI-ARIA. |

### ids-from-use-id → id-unique-in-its-document · MUST

An id comes from `useId`. It is never typed by hand or random, save the id of an element, never a labelled control, that the root renders once and other code must know — a skip link's target, an SVG's shared `<defs>` —, which is a constant with a suppression that says so.

| Why |
|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. |
