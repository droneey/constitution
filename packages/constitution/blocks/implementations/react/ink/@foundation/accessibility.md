# Accessibility

> Governs what Ink's screen-reader output reads of a control or a status.

## Controls

### ink-control-named-by-aria-props → every-control-has-an-accessible-name · MUST

Every Ink control or status declares what it is to Ink's screen-reader mode. A control or a status an Ink tree renders, such as a choice, a check, a field, a progress bar or a spinner, carries the `aria-role` and `aria-state` Ink offers for it, and an `aria-label` wherever its text alone does not say what it is, and a glyph that only decorates is `aria-hidden`.

| Why |
|---|
| in Ink's screen-reader mode these props are what is read out, so without them a person who cannot see the frame hears a spinner's frames or a bar's blocks as noise and never learns the name and role of the control — WCAG 2.2, Name, Role, Value. |
