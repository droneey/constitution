# Testing Library with React DOM

> Specs that render into a document and query it.

### no-document-selectors-in-specs · MUST
`container.querySelector` and class selectors are forbidden.

| Why | Tags |
|---|---|
| a selector finds what the document's structure holds, not what a person perceives, and breaks when the markup changes and the screen does not. | [a11y, testing] |

## Accessibility

### ui-specs-run-the-axe-scan → ui-specs-scan-accessibility
Every screen and component spec runs the axe scan over what it rendered, on the WCAG 2.2 A and AA rules only, and passes with zero violations. Contrast, which a simulated DOM cannot judge, is turned off there and is the token-pair test's; the landmark rule runs in screen specs, not over a lone component.

| Why | Tags |
|---|---|
| the scan catches a third of the problems in every spec, on every change, for free. | [] |
