import { describe, expect, it, mock } from 'bun:test';

import { ColourLevel } from '#/libs/ui';

import {
  createPlainOutput,
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
  it('should point at the first answer when it opens', () => {
    // Arrange
    const tree = (
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />
    );

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('Runtime?\n› Bun\n  Node.js');
  });

  it.each([
    {
      keys: [
        Key.Down,
        Key.Enter,
      ],
      answer: 'node',
    },
    {
      keys: [
        Key.Up,
        Key.Enter,
      ],
      answer: 'node',
    },
    {
      keys: [
        Key.Down,
        Key.Down,
        Key.Enter,
      ],
      answer: 'bun',
    },
  ])(
    'should give the answer the pointer is on when Enter follows $keys',
    async ({ answer, keys }) => {
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
    },
  );

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

  it("should draw the answer the pointer is on in the accent's colour when the run shows colour", () => {
    // Arrange
    const output = createPlainOutput({
      colourLevel: ColourLevel.Basic,
    });

    // Act
    const { lastFrame } = renderWithTheme(
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />,
      output,
    );

    // Assert
    expect(lastFrame()?.split('\n').slice(1)).toStrictEqual([
      // biome-ignore lint/security/noSecrets: the escape codes of a terminal's colours, no secret
      '\u001B[97m›\u001B[39m \u001B[97mBun\u001B[39m',
      '  Node.js',
    ]);
  });

  it('should give nothing when Enter falls on no answer', async () => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Select
        choices={[]}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.Enter,
    ]);

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
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

  it('should read out the question, its answers and the one selected', () => {
    // Arrange
    const tree = (
      <Select
        choices={CHOICES}
        message='Runtime?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />
    );

    // Act
    const spoken = screenReaderOutputOf(tree);

    // Assert
    expect(spoken).toBe('listbox: Runtime?\noption: (selected) Bun\noption: Node.js');
  });
});
