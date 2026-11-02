# Accessibility

> Governs how the theme shows focus.

## General

### focus-shown-by-focusable-utility → focus-always-visible · MUST

Focus is shown by the design system's `focusable` utility, which draws an outline, or by a ring beside `outline-hidden`. No other class removes an outline.

| Why |
|---|
| a class that removes the outline with no ring in its place leaves a keyboard user unable to see where focus is — WCAG 2.2, Focus Visible. |
