# Motion

> Governs an Ink animation: its timer, its pace and when it stops.

## General

### ink-animation-driven-by-use-animation → reduced-motion-honoured · MUST

An Ink animation runs on **`useAnimation`**, never on a timer of its own, and stops where the run asks for reduced motion. Such an animation — a spinner, a step that runs, a bar that fills — is then inactive, `isActive: false`.

| Why |
|---|
| a timer of a component's own redraws the frame on a tick of its own and keeps animating after the user asked for stillness, where Ink's animations on one shared timer redraw once per tick and one setting stops them all. |
