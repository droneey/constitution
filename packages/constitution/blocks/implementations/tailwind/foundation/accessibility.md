# Accessibility

> Governs how the theme shows focus.

## General

### focus-shown-by-focusable-utility → focus-always-visible · MUST

Focus is shown by the design system's `focusable` utility, which draws an outline, or by a ring beside `outline-hidden`; no other class removes an outline.

| Why |
|---|
| one utility draws the same visible ring everywhere, and no component removes focus without it. |
