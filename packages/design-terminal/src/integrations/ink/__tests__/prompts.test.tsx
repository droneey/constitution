import { describe, expect, it, mock } from 'bun:test';

import { ColourLevel } from '#/libs/ui';

import { Confirm, Select, TextInput } from '../components';
import {
  createPlainOutput,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
  settle,
} from './ink.fixtures';

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
];

const CHOICES = [
  {
    label: 'Bun',
    value: 'bun',
  },
  {
    label: 'Node.js',
    value: 'node',
  },
];

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
    stdin.write(Key.Enter);
    await settle();

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
    stdin.write(Key.Interrupt);
    await settle();

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

describe('Confirm', () => {
  it.each([
    {
      defaultAnswer: true,
      frame: 'Overwrite? (Y/n)',
    },
    {
      defaultAnswer: false,
      frame: 'Overwrite? (y/N)',
    },
  ])('should show the default in capitals: $frame', ({ defaultAnswer, frame }) => {
    // Arrange
    const tree = (
      <Confirm
        defaultAnswer={defaultAnswer}
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />
    );

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe(frame);
  });

  it.each([
    {
      key: 'y',
      answer: true,
    },
    {
      key: 'Y',
      answer: true,
    },
    {
      key: 'n',
      answer: false,
    },
    {
      key: 'N',
      answer: false,
    },
    {
      key: Key.Enter,
      answer: false,
    },
  ])('should answer $answer when $key is pressed', async ({ answer, key }) => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        defaultAnswer={false}
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
      />,
    );

    // Act
    stdin.write(key);
    await settle();

    // Assert
    expect(onSubmit.mock.calls).toStrictEqual([
      [
        answer,
      ],
    ]);
  });

  it('should neither answer nor interrupt when another key is pressed', async () => {
    // Arrange
    const onSubmit = mock();
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        defaultAnswer
        message='Overwrite?'
        onInterrupt={onInterrupt}
        onSubmit={onSubmit}
      />,
    );

    // Act
    await pressKeys(stdin, [
      'x',
      'c',
      Key.CtrlA,
    ]);

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInterrupt).not.toHaveBeenCalled();
  });

  it('should interrupt when Ctrl-C is pressed', async () => {
    // Arrange
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        defaultAnswer
        message='Overwrite?'
        onInterrupt={onInterrupt}
        onSubmit={mock()}
      />,
    );

    // Act
    stdin.write(Key.Interrupt);
    await settle();

    // Assert
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });

  it('should read out the question and that it takes yes or no', () => {
    // Arrange
    const tree = (
      <Confirm
        defaultAnswer
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={mock()}
      />
    );

    // Act
    const spoken = screenReaderOutputOf(tree);

    // Assert
    expect(spoken).toBe('Overwrite?, yes or no');
  });
});

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
