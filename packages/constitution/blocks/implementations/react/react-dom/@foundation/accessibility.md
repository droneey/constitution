# Accessibility

> Governs ARIA, labels and ids in JSX.

## Controls

### labels-bound-by-html-for → every-control-has-an-accessible-name · MUST

Every label names its control with `htmlFor`.

| Why |
|---|
| a label not bound to its control by `htmlFor` names it only while it wraps it, so a control moved out of its label reaches assistive technology without its name — WCAG 2.2, Name, Role, Value. |

## ARIA and ids

### aria-attributes-written-hyphenated → wcag-aa-conformance · MUST

Every ARIA attribute in JSX is written hyphenated, as the DOM spells it, never in camelCase.

| Why |
|---|
| a camelCase ARIA prop is no attribute the browser knows, so assistive technology never sees the state it was meant to carry — WAI-ARIA. |

### ids-from-use-id → id-unique-in-its-document · MUST

Every id comes from `useId`, never typed by hand or random. Exempt: the id of an element the root renders once and other code names, never a labelled control, such as a skip link's target or an SVG's shared `<defs>`, which is a constant under a suppression that says so.

| Why |
|---|
| a typed id collides when the component renders twice, and a random one differs between server and client. |
