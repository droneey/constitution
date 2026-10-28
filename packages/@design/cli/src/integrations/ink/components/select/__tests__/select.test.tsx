import { describe, expect, it, mock } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { createMarkingTheme, markedSpansOf } from '#/__tests__/theme.fixtures';

import {
  frameOf,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { Select } from '../select';

const THREE_CHOICES = [
  {
    label: 'Bun',
    value: 'bun',
  },
  {
    label: 'Node.js',
    value: 'node',
  },
  {
    label: 'Deno',
    value: 'deno',
  },
] as const;

const CHOICES = [
  {
    label: 'Bun',
    value: 'bun',
  },
  {
    label: 'Node.js',
    value: 'node',
  },
] as const;

describe('Select', () => {
  it('should point at the first answer when it opens, and read out the question, its answers and the one selected, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      opened: frameOf(
        <Select
          choices={CHOICES}
          message='Runtime?'
          onInterrupt={mock()}
          onSubmit={mock()}
        />,
      ),
      'read out': screenReaderOutputOf(
        <Select
          choices={CHOICES}
          message='Runtime?'
          onInterrupt={mock()}
          onSubmit={mock()}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('select.golden.txt', import.meta.url)));
  });

  it.each([
    {
      condition: 'Down moves to the next answer',
      keys: [
        Key.Down,
        Key.Enter,
      ],
      answer: 'node',
    },
    {
      condition: 'Down past the last answer wraps to the first',
      keys: [
        Key.Down,
        Key.Down,
        Key.Enter,
      ],
      answer: 'bun',
    },
  ])('should give the answer the pointer is on when $condition', async ({ answer, keys }) => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
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
  });

  it('should wrap from the first answer to the last when Up is pressed', async () => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Select
        choices={THREE_CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.Up,
      Key.Enter,
    ]);

    // Assert
    expect(onSubmit.mock.calls).toStrictEqual([
      [
        'deno',
      ],
    ]);
  });

  it.each([
    {
      condition: 'Enter falls on the last answer',
      keys: [
        Key.Enter,
      ],
      answer: 'node',
    },
    {
      condition: 'Down from the last answer wraps to the first',
      keys: [
        Key.Down,
        Key.Enter,
      ],
      answer: 'bun',
    },
    {
      condition: 'Up from the last answer moves to the one before',
      keys: [
        Key.Up,
        Key.Enter,
      ],
      answer: 'bun',
    },
  ])(
    'should keep the pointer on the list when the answers shrink below it and $condition',
    async ({ answer, keys }) => {
      // Arrange
      const onSubmit = mock();
      const { rerender, stdin } = renderWithTheme(
        <Select
          choices={THREE_CHOICES}
          message='Runtime?'
          onInterrupt={mock()}
          onSubmit={onSubmit}
        />,
      );

      await pressKeys(stdin, [
        Key.Up,
      ]);
      rerender(
        <Select
          choices={CHOICES}
          message='Runtime?'
          onInterrupt={mock()}
          onSubmit={onSubmit}
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

  it('should neither answer nor interrupt when another key, Ctrl with it or not, is pressed', async () => {
    // Arrange
    const onSubmit = mock();
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={onInterrupt}
        onSubmit={onSubmit}
      />,
    );

    // Act
    await pressKeys(stdin, [
      'c',
      Key.CtrlA,
    ]);

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInterrupt).not.toHaveBeenCalled();
  });

  it('should draw the question in bold and the answer the pointer is on in the accent', () => {
    // Arrange
    const theme = createMarkingTheme();

    // Act
    const frame = frameOf(
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />,
      theme,
    );

    // Assert
    expect(markedSpansOf(frame)).toStrictEqual([
      [
        'strong',
        'Runtime?',
      ],
      [
        'accent',
        '›',
      ],
      [
        'accent',
        'Bun',
      ],
    ]);
  });

  it('should interrupt when Ctrl-C is pressed', async () => {
    // Arrange
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={onInterrupt}
        onSubmit={mock()}
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.Interrupt,
    ]);

    // Assert
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });
});
