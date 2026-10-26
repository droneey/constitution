import { describe, expect, it, mock } from 'bun:test';

import {
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
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

  it('should show what was typed, a Backspace taking the last character', async () => {
    // Arrange
    const { lastFrame, stdin } = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={mock()}
        onSubmit={mock()}
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

    // Assert
    expect(lastFrame()).toBe('Name? › ab');
  });

  it('should give what was typed when Enter is pressed', async () => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
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
      Key.Enter,
    ]);

    // Assert
    expect(onSubmit.mock.calls).toStrictEqual([
      [
        'ab',
      ],
    ]);
  });

  it('should interrupt when Ctrl-C is pressed', async () => {
    // Arrange
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={onInterrupt}
        onSubmit={mock()}
        placeholder='my-project'
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.Interrupt,
    ]);

    // Assert
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });

  it('should neither type nor interrupt when another control key is pressed', async () => {
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

    // Assert
    expect({
      frame: lastFrame(),
      interrupts: onInterrupt.mock.calls.length,
    }).toStrictEqual({
      frame: 'Name? › my-project',
      interrupts: 0,
    });
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
