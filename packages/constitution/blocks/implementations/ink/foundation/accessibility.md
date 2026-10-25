# Accessibility

> Governs what Ink's screen-reader output reads of a control or a status.

## Controls

### ink-control-named-by-aria-props → every-control-has-an-accessible-name · MUST

A control or a status an Ink tree renders — a choice, a check, a field, a progress bar, a spinner — carries `aria-role`, its `aria-state` and an `aria-label` wherever its text alone does not say what it is, and a glyph that only decorates is `aria-hidden`.

| Why |
|---|
| in Ink's screen-reader mode these props are what is read out, and a spinner's frames or a bar's blocks read as noise. |
