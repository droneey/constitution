# Design system

> Governs the pace of an Ink animation where the design system owns the look.

## Motion

### ink-animation-interval-from-a-duration-token → motion-from-tokens · MUST

The interval `useAnimation` takes is a duration token of the design system, read through its theme, never a number written in the component.

| Why |
|---|
| the pace of a spinner is then the one the rest of the interface moves at, and a change of the token reaches every animation at once. |
