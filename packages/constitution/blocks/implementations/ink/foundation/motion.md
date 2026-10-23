# Motion

> Governs an Ink animation: its timer, its pace and when it stops.

## General

### ink-animation-driven-by-use-animation → reduced-motion-honoured · MUST

An Ink animation — a spinner, a step that runs, a bar that fills — is driven by `useAnimation`, and is inactive, `isActive: false`, where the run asks for reduced motion; no component keeps a timer of its own.

| Why | Tags |
|---|---|
| Ink's animations then share one timer and redraw once per tick, and one setting stops every one of them, while a timer of a component's own keeps redrawing after the user asked for stillness. | [a11y, performance] |
