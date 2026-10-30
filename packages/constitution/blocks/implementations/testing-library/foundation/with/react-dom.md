# React DOM

> Governs specs that render into a document and query it.

## General

### spec-never-selects-from-the-document → element-found-by-role-label-or-text · MUST

No spec calls `querySelector` or `querySelectorAll` on the container, the document or an element.

| Why |
|---|
| a query of the document finds what its markup holds, and breaks when the markup changes and the screen does not. |

## Accessibility

### ui-specs-run-the-axe-scan → ui-specs-scan-accessibility · MUST

A screen or component spec runs the axe scan over each state it renders that no narrower spec renders, on the WCAG 2.2 A and AA rules only, and passes with zero violations. Contrast, which a simulated DOM cannot judge, is turned off there and is the token-pair test's; the landmark rule runs in screen specs, not over a lone component.

| Why |
|---|
| the scan catches a third of the problems, on every change, for free. |
