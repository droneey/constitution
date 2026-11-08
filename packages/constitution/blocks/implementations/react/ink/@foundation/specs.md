# Specs

> Governs the specs that render an Ink tree: the frame they read, the keys they press and the screen-reader output they check.

## Frames and keys

### ink-component-spec-reads-the-frame → component-spec-proves-its-interaction · SHOULD

Every Ink component's spec reads the frame a person sees. It renders the component with the `render` of `ink-testing-library`, presses keys by writing to its `stdin`, and asserts the text of `lastFrame()` with the colour stripped.

#### Why

A spec that asserts anything but the frame passes while the person at the terminal sees something else, and one that asserts colour fails on another terminal or under `NO_COLOR` though no text a person reads changed.

#### Examples

```tsx title="Avoid"
test('should check gift wrap when space is pressed', () => {
  // Arrange
  const onChange = createSpy();

  // Act
  GiftWrapCheck({ isChecked: false, onChange });

  // Assert
  expect(onChange.calls).toEqual([]);
});
```

```tsx title="Prefer"
test('should check gift wrap when space is pressed', () => {
  // Arrange
  const { stdin, lastFrame } = render(<GiftWrapField />);

  // Act
  stdin.write(' ');

  // Assert
  expect(stripVTControlCharacters(lastFrame() ?? '')).toContain('[x] Gift wrap');
});
```

## Screen readers

### ink-control-spec-reads-the-screen-reader-output → unscannable-criterion-proven-where-it-renders · MUST

Every Ink control's spec checks what Ink's screen-reader mode reads out. It renders the control in screen-reader mode, through `INK_SCREEN_READER=true` under the `render` of `ink-testing-library` or `isScreenReaderEnabled` under Ink's own, and asserts the role, the state and the label of that output.

#### Why

No accessibility scanner reads a terminal, so a control whose spec skips the screen-reader output reaches a person who cannot see the frame unnamed, and nothing fails.

#### Examples

```tsx title="Avoid"
test('should read gift wrap as checked', () => {
  // Arrange
  const { lastFrame } = render(<GiftWrapCheck isChecked />);

  // Act
  const frame = stripVTControlCharacters(lastFrame() ?? '');

  // Assert
  expect(frame).toContain('[x]');
});
```

```tsx title="Prefer"
test('should read gift wrap as checked', () => {
  // Arrange
  const stdout = createFakeStdout();

  // Act
  render(<GiftWrapCheck isChecked />, { stdout, isScreenReaderEnabled: true }).unmount();

  // Assert
  expect(stdout.lastFrame()).toMatch(/checkbox.*Gift wrap.*checked/);
});
```
