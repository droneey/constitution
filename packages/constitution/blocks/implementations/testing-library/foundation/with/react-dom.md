# React DOM

> Governs specs that render into a document and query it.

## General

### spec-never-selects-from-the-document → element-found-by-role-label-or-text · MUST

No spec queries the document by a selector. A spec calls no `querySelector` or `querySelectorAll` on the container, the document or an element, and finds an element no person perceives by its `data-testid`; the one spec of a selector the program configures a framework with queries through that constant, under a suppression that states why, and asserts the element the selector must name.

| Why |
|---|
| a query of the document finds what its markup holds and breaks when the markup changes and the screen does not, while a `data-testid` is set for the spec alone and stays; a framework's selector is that markup, and only a query through it proves it still names its element. |

## Accessibility

### ui-specs-run-the-axe-scan → rendered-state-scanned-for-accessibility-once · MUST

A screen or component spec scans with axe each state it renders that no narrower spec renders. It scans on the WCAG 2.2 A and AA rules only, and passes with zero violations. Contrast, which a simulated DOM cannot judge, is turned off there and is the token-pair test's; the landmark rule runs in screen specs, not over a lone component.

| Why |
|---|
| a state no spec scans ships a violation a simulated document would have caught, found only by a person who cannot use the screen; a scan in each state's spec fails the change that brings it. |
