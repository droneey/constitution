import { describe, expect, it, mock } from 'bun:test';

import {
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
  settle,
} from '../../../__tests__/ink.fixtures';
import { TextInput } from '../text-input';

describe('TextInput', () => {
  it('should show the placeholder until a key is pressed', () => {
    // Arrange
    const tree = (
      <TextInput
        message='Name?'
        onInterrupt={mock()}
        onSubmit={mock()}
        placeholder='my-project'
      />
    );

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('Name? › my-project');
  });

  it('should give what was typed, a Backspace taking the last character', async () => {
    // Arrange
    const onSubmit = mock();
    const { lastFrame, stdin } = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
        placeholder='my-project'
      />,
    );

    // Act
    await pressKeys(stdin, [
      'a',
      'b',
      'x',
      Key.Backspace,
    ]);

    const frame = lastFrame();

    stdin.write(Key.Enter);
    await settle();

    // Assert
    expect(frame).toBe('Name? › ab');
    expect(onSubmit.mock.calls).toStrictEqual([
      [
        'ab',
      ],
    ]);
  });

  it('should interrupt when Ctrl-C is pressed, and type nothing for another control key', async () => {
    // Arrange
    const onInterrupt = mock();
    const { lastFrame, stdin } = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={onInterrupt}
        onSubmit={mock()}
        placeholder='my-project'
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.CtrlA,
    ]);

    const callsAfterCtrlA = onInterrupt.mock.calls.length;

    await pressKeys(stdin, [
      Key.Interrupt,
    ]);

    // Assert
    expect(lastFrame()).toBe('Name? › my-project');
    expect(callsAfterCtrlA).toBe(0);
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });

  it('should read out the question as a text box', () => {
    // Arrange
    const tree = (
      <TextInput
        message='Name?'
        onInterrupt={mock()}
        onSubmit={mock()}
        placeholder='my-project'
      />
    );

    // Act
    const spoken = screenReaderOutputOf(tree);

    // Assert
    expect(spoken).toBe('textbox: Name? my-project');
  });
});
