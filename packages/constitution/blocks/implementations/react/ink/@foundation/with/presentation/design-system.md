# Design system

> Governs the pace of an Ink animation where the design system owns the look.

## Motion

### ink-animation-interval-from-a-duration-token → motion-from-tokens · MUST

Every interval `useAnimation` takes is a duration token of the design system, read through its theme, never a number in the component.

| Why |
|---|
| a number written in a component moves its animation at a pace of its own, out of step with the rest of the interface, and a change of the token never reaches it — a single source of truth. |
