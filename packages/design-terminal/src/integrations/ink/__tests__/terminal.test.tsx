import { describe, expect, it } from 'bun:test';

import { Text } from 'ink';

import { AnswerKind, askConfirm, askSelect, askText, openTerminalView } from '../terminal';
import {
  createPlainOutput,
  createTerminalInput,
  createTerminalOutput,
  Key,
  settle,
} from './ink.fixtures';

const createStreams = () => ({
  stdin: createTerminalInput(),
  stdout: createTerminalOutput(),
});

describe('openTerminalView', () => {
  it('should draw what it is shown and restore the terminal when it closes', async () => {
    // Arrange
    const streams = createStreams();
    const view = openTerminalView({
      streams,
      output: createPlainOutput(),
    });

    // Act
    view.show(<Text>checking</Text>);
    await view.close();

    // Assert
    expect(streams.stdout.written.join('')).toContain('checking');
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

    // Act
    await settle();
    streams.stdin.write(Key.Down);
    await settle();
    streams.stdin.write(Key.Enter);

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

    // Act
    await settle();
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
    });

    // Act
    await settle();
    streams.stdin.write(Key.Enter);
    await asked;

    // Assert
    expect(streams.stdin.listenerCount('readable')).toBe(0);
  });
});

describe('askConfirm', () => {
  it('should give the default when Enter is pressed', async () => {
    // Arrange
    const streams = createStreams();
    const asked = askConfirm({
      defaultAnswer: true,
      message: 'Overwrite?',
      streams,
      output: createPlainOutput(),
    });

    // Act
    await settle();
    streams.stdin.write(Key.Enter);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Given,
      value: true,
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

    // Act
    await settle();
    streams.stdin.write('x');
    await settle();
    streams.stdin.write(Key.Enter);

    // Assert
    expect(await asked).toStrictEqual({
      kind: AnswerKind.Given,
      value: 'x',
    });
  });
});
