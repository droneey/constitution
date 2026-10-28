import { describe, expect, it, mock } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';

import {
  frameOf,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { TextInput } from '../text-input';

describe('TextInput', () => {
  it('should show the placeholder until a key is pressed, then what was typed, and read out the question as a text box, as the golden file shows them', async () => {
    // Arrange
    const typed = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={mock()}
        onSubmit={mock()}
        placeholder='my-project'
      />,
    );

    await pressKeys(typed.stdin, [
      'a',
      'b',
    ]);

    // Act
    const golden = goldenOf({
      'the placeholder before a key': frameOf(
        <TextInput
          message='Name?'
          onInterrupt={mock()}
          onSubmit={mock()}
          placeholder='my-project'
        />,
      ),
      'what was typed': typed.lastFrame(),
      'read out': screenReaderOutputOf(
        <TextInput
          message='Name?'
          onInterrupt={mock()}
          onSubmit={mock()}
          placeholder='my-project'
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('text-input.golden.txt', import.meta.url)));
  });

  it.each([
    {
      condition: 'a Backspace takes the last character',
      keys: [
        'a',
        'b',
        'x',
        Key.Backspace,
        Key.Enter,
      ],
      answer: 'ab',
    },
    {
      condition: 'a Backspace takes a character beyond the basic plane whole',
      keys: [
        'a',
        '\u{1D4CE}',
        Key.Backspace,
        Key.Enter,
      ],
      answer: 'a',
    },
  ])(
    'should give what was typed when Enter is pressed and $condition',
    async ({ answer, keys }) => {
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
      await pressKeys(stdin, keys);

      // Assert
      expect(onSubmit.mock.calls).toStrictEqual([
        [
          answer,
        ],
      ]);
    },
  );

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
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <TextInput
        message='Name?'
        onInterrupt={onInterrupt}
        onSubmit={onSubmit}
        placeholder='my-project'
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.CtrlA,
      Key.Enter,
    ]);

    // Assert
    expect({
      interrupts: onInterrupt.mock.calls.length,
      submitted: onSubmit.mock.calls,
    }).toStrictEqual({
      interrupts: 0,
      submitted: [
        [
          '',
        ],
      ],
    });
  });
});
