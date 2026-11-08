# Motion

> Governs an Ink animation: its timer and when it stops.

## General

### ink-animation-driven-by-use-animation · SHOULD

Every Ink animation runs on `useAnimation`, never on a timer of its own. Such an animation is a spinner, a step that runs or a bar that fills.

| Why |
|---|
| a timer of a component's own redraws the frame at a pace of its own, while Ink's animations share one timer and redraw the frame once for all of them. |

### ink-animation-inactive-under-reduced-motion → reduced-motion-honoured · MUST

Every Ink animation is inactive while the run asks for reduced motion through the option or setting the program declares for it. Its `useAnimation` is then given `isActive: false`.

| Why |
|---|
| an animation left active keeps moving after the person asked for stillness, and one setting given to every animation stops them all. |
