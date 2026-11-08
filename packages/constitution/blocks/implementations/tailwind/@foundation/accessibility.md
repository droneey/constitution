# Accessibility

> Governs how a class list shows focus.

## General

### focus-shown-by-an-outline-utility → focus-ring-drawn-as-an-outline · MUST

Every focus ring is an outline, from Tailwind's `outline-*` utilities or the project's own `@utility`, or a ring beside `outline-hidden`. No other class removes an outline.

| Why |
|---|
| a class that removes the outline with no ring in its place leaves a keyboard user unable to see where focus is, and `outline-hidden` keeps a transparent outline that forced-colors mode repaints — WCAG 2.2, Focus Visible. |
