# Tests

> Governs the specs of screens and components.

## Specs

### screen-spec-proves-states-and-interactions → spec-proves-one-boundary · SHOULD
A screen's spec proves each data state, each interaction that changes something, each message the user sees and each navigation.

| Why | Tags |
|---|---|
| that is what a person does with a screen; a spec that proves it fails when their experience changes. | [ux, testing] |

### component-spec-proves-behaviour-and-keyboard → spec-proves-one-boundary · SHOULD
A reusable component's spec proves the variants that change behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

| Why | Tags |
|---|---|
| a component used on many screens breaks all of them at once; its spec is where that is caught. | [a11y, testing] |

### element-found-by-role-label-or-text → case-asserts-what-a-caller-observes · MUST
An element a spec looks for is found by its role, its label or its text, never by a class or internal state.

| Why | Tags |
|---|---|
| a spec that finds elements as a user does changes only when the behaviour does. | [a11y, testing] |

### layout-and-focus-proven-on-the-platform · SHOULD
Behaviour that depends on layout, visibility or real focus is proven where the platform renders it — an end-to-end spec, or a component spec the platform's own engine runs — never only in a simulation of the platform.

| Why | Tags |
|---|---|
| a simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable. | [a11y, testing] |

## Accessibility

### ui-specs-scan-accessibility · MUST
Every screen and component spec runs an accessibility scan, and passes with zero violations.

| Why | Tags |
|---|---|
| a scan catches many problems for free, on every change, before a person has to. | [a11y, testing] |

### interactive-checked-by-hand · SHOULD
Before a new interactive component ships, a person operates it with the keyboard or a switch, and with a screen reader: Tab reaches it in visual order, Enter and Space activate it, Escape closes what it opened, and focus returns to what opened it.

| Why | Tags |
|---|---|
| tools see a third of the problems; the rest are found only by using the component as its users do. | [a11y] |

## Requirements for implementation

### a11y-scanner-runs-inside-a-spec · MUST
The scanner runs over the rendered tree inside a spec, covers the WCAG 2.2 A and AA rules it can decide, and reports each violation with its element.

| Why | Tags |
|---|---|
| without it, the scan cannot run in every spec, and a violation cannot be traced to its element. | [a11y, testing] |
