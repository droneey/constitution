import { describe, expect, it } from 'bun:test';

import { Text } from 'ink';

import { ConfirmWords } from '#/libs/ui';

import { TextInput } from '../components';
import { AnswerKind, askConfirm, askSelect, askText, openTerminalView } from '../terminal';
import {
  createPlainOutput,
  createTerminalInput,
  createTerminalOutput,
  englishWords,
  Key,
  pressKeys,
  settle,
} from './ink.fixtures';

const createStreams = () => ({
  stdin: createTerminalInput(),
  stdout: createTerminalOutput(),
});

describe('openTerminalView', () => {
  it('should leave the last tree it was shown on the terminal when it closes', async () => {
    // Arrange
    const streams = createStreams();
    const view = openTerminalView({
      streams,
      output: createPlainOutput(),
    });

    view.show(<Text>checking</Text>);

    // Act
    await view.close();

    // Assert
    expect(streams.stdout.written.join('')).toContain('checking');
  });

  it('should give the keyboard back when it closes', async () => {
    // Arrange
    const streams = createStreams();
    const view = openTerminalView({
      streams,
      output: createPlainOutput(),
    });

    view.show(
      <TextInput
        message='Name?'
        onInterrupt={(): void => undefined}
        onSubmit={(): void => undefined}
        placeholder='my-project'
      />,
    );

    await settle();

    // Act
    await view.close();

    // Assert
    expect({
      isRaw: streams.stdin.isRaw,
      readers: streams.stdin.listenerCount('readable'),
    }).toStrictEqual({
      isRaw: false,
      readers: 0,
    });
  });
});

describe('askSelect', () => {
  it('should give the answer chosen with the keys', async () => {
    // Arrange
    const streams = createStreams();
    const asked = askSelect({
      choices: [
        {
          label: 'Bun',
          value: 'bun',
        },
        {
          label: 'Node.js',
          value: 'node',
        },
      ],
      message: 'Runtime?',
      streams,
      output: createPlainOutput(),
    });

    await settle();

    // Act
    await pressKeys(streams.stdin, [
      Key.Down,
      Key.Enter,
    ]);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Given,
      value: 'node',
    });
  });

  it('should end as interrupted when Ctrl-C is pressed', async () => {
    // Arrange
    const streams = createStreams();
    const asked = askSelect({
      choices: [
        {
          label: 'Bun',
          value: 'bun',
        },
      ],
      message: 'Runtime?',
      streams,
      output: createPlainOutput(),
    });

    await settle();

    // Act
    streams.stdin.write(Key.Interrupt);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Interrupted,
    });
  });
});

describe('ask', () => {
  it('should stop reading the keyboard once the question is answered', async () => {
    // Arrange
    const streams = createStreams();
    const asked = askConfirm({
      defaultAnswer: true,
      message: 'Overwrite?',
      output: createPlainOutput(),
      streams,
      words: englishWords,
    });

    await settle();

    // Act
    streams.stdin.write(Key.Enter);

    // Assert
    await asked;
    expect(streams.stdin.listenerCount('readable')).toBe(0);
  });
});

describe('askConfirm', () => {
  it.each([
    {
      condition: 'Enter is pressed',
      answer: true,
      key: Key.Enter,
      words: englishWords,
    },
    {
      condition: 'the key of its words for no is pressed',
      answer: false,
      key: 'н',
      words: ConfirmWords.create({
        locale: 'uk',
        no: 'ні',
        yes: 'так',
      }),
    },
  ])('should give the answer when $condition', async ({ answer, key, words }) => {
    // Arrange
    const streams = createStreams();
    const asked = askConfirm({
      defaultAnswer: true,
      message: 'Overwrite?',
      streams,
      output: createPlainOutput(),
      words,
    });

    await settle();

    // Act
    streams.stdin.write(key);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Given,
      value: answer,
    });
  });
});

describe('askText', () => {
  it('should give what was typed when Enter is pressed', async () => {
    // Arrange
    const streams = createStreams();
    const asked = askText({
      message: 'Name?',
      placeholder: 'my-project',
      streams,
      output: createPlainOutput(),
    });

    await settle();

    // Act
    await pressKeys(streams.stdin, [
      'x',
      Key.Enter,
    ]);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Given,
      value: 'x',
    });
  });
});
