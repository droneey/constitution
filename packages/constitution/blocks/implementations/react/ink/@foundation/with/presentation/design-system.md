# Design system

> Governs the pace of an Ink animation where the design system owns the look.

## Motion

### ink-animation-interval-from-a-motion-token → motion-from-tokens · MUST

Every interval `useAnimation` takes is the duration of a semantic motion token, read through the theme, never a number in the component.

#### Why

A number written in a component moves its animation at a pace of its own, out of step with the rest of the interface, and a change of the token never reaches it — a single source of truth.

#### Examples

```tsx title="Avoid"
const { frame } = useAnimation({ interval: 80, isActive: !isReducedMotion });
```

```tsx title="Prefer"
const theme = useTheme();
const { frame } = useAnimation({
  interval: theme.motion.spin.standard.duration,
  isActive: !isReducedMotion,
});
```
