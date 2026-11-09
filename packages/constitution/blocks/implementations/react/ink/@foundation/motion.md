# Motion

> Governs an Ink animation: its timer and when it stops.

## General

### ink-animation-driven-by-use-animation · SHOULD

Every Ink animation runs on `useAnimation`, never on a timer of its own. Such an animation is a spinner, a step that runs or a bar that fills.

#### Why

A timer of a component's own redraws the frame at a pace of its own, while Ink's animations share one timer and redraw the frame once for all of them.

#### Examples

```tsx title="Avoid"
export const Spinner = ({ isReducedMotion }: SpinnerProps): ReactElement => {
  const theme = useTheme();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    const timer = setInterval(
      () => setFrame((current) => current + 1),
      theme.motion.spin.standard.duration,
    );

    return () => clearInterval(timer);
  }, [isReducedMotion, theme]);

  return <Text>{spinnerFrames[frame % spinnerFrames.length]}</Text>;
};
```

```tsx title="Prefer"
export const Spinner = ({ isReducedMotion }: SpinnerProps): ReactElement => {
  const theme = useTheme();
  const { frame } = useAnimation({
    interval: theme.motion.spin.standard.duration,
    isActive: !isReducedMotion,
  });

  return <Text>{spinnerFrames[frame % spinnerFrames.length]}</Text>;
};
```

### ink-animation-inactive-under-reduced-motion → reduced-motion-honoured · MUST

Every Ink animation is inactive while the run asks for reduced motion through the option or setting the program declares for it. Its `useAnimation` is then given `isActive: false`.

#### Why

An animation left active keeps moving after the person asked for stillness, and one setting given to every animation stops them all.

#### Examples

```tsx title="Avoid"
export const Spinner = ({ isReducedMotion }: SpinnerProps): ReactElement => {
  const theme = useTheme();
  const { frame } = useAnimation({ interval: theme.motion.spin.standard.duration });

  return <Text>{isReducedMotion ? '' : spinnerFrames[frame % spinnerFrames.length]}</Text>;
};
```

```tsx title="Prefer"
export const Spinner = ({ isReducedMotion }: SpinnerProps): ReactElement => {
  const theme = useTheme();
  const { frame } = useAnimation({
    interval: theme.motion.spin.standard.duration,
    isActive: !isReducedMotion,
  });

  return <Text>{spinnerFrames[frame % spinnerFrames.length]}</Text>;
};
```
