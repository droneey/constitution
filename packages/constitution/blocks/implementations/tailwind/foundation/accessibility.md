# Accessibility

> Governs focus, reduced motion and the sizes of type in the theme.

## General

### focus-shown-by-focusable-utility → focus-always-visible · MUST

Focus is shown by the design system's `focusable` utility, which draws an outline, or by a ring beside `outline-hidden`; no other class removes an outline.

| Why | Tags |
|---|---|
| one utility draws the same visible ring everywhere, and no component removes focus without it. | [] |

### motion-tokens-honour-reduced-motion → reduced-motion-honoured · MUST

The motion tokens collapse under reduced motion, in the theme.

| Why | Tags |
|---|---|
| every animation reads the tokens, so one rule in the theme stops them all. | [] |

### type-tokens-in-rem → type-sized-in-rem · MUST

Font-size tokens are in `rem`, and line-height tokens are unitless ratios.

| Why | Tags |
|---|---|
| the user's text size then scales every text of the user interface. | [] |
