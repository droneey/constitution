# React DOM

> Governs specs that render into a document and query it.

## General

### spec-never-selects-from-the-document → element-found-by-role-label-or-text · MUST

No spec calls `querySelector` or `querySelectorAll` on the container, the document or an element; an element no person perceives is found by its `data-testid`. The one spec of a selector the program configures a framework with queries through that constant under a suppression that states why, and asserts the element it must name.

| Why |
|---|
| a query of the document finds what its markup holds and breaks when the markup changes and the screen does not, while a `data-testid` is set for the spec alone and stays; a framework's selector is that markup, and only a query through it proves it still names its element. |

## Accessibility

### ui-specs-run-the-axe-scan → ui-specs-scan-accessibility · MUST

Every screen and component spec runs the axe scan over what it rendered, on the WCAG 2.2 A and AA rules only, and passes with zero violations. Contrast, which a simulated DOM cannot judge, is turned off there and is the token-pair test's; the landmark rule runs in screen specs, not over a lone component.

| Why |
|---|
| the scan catches a third of the problems in every spec, on every change, for free. |
