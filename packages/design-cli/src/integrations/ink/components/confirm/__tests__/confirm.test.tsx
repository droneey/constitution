import { describe, expect, it, mock } from 'bun:test';

import {
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
  settle,
} from '../../../__tests__/ink.fixtures';
import { Confirm } from '../confirm';

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
    // biome-ignore lint/plugin/case-pins-meaning-never-wording: the one golden of what the prompt says to a screen reader
    expect(spoken).toBe('Overwrite?, yes or no');
  });
});
