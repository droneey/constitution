import { describe, expect, it, mock } from 'bun:test';

import { ConfirmWords } from '#/libs/ui';

import {
  englishWords,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { Confirm } from '../confirm';

const ukrainian = ConfirmWords.create({
  locale: 'uk',
  no: 'ні',
  yes: 'Так',
});

describe('Confirm', () => {
  it.each([
    {
      defaultAnswer: true,
      frame: 'Overwrite? (Y/n)',
      words: englishWords,
    },
    {
      defaultAnswer: false,
      frame: 'Overwrite? (y/N)',
      words: englishWords,
    },
    {
      defaultAnswer: true,
      frame: 'Overwrite? (Т/н)',
      words: ukrainian,
    },
    {
      defaultAnswer: false,
      frame: 'Overwrite? (т/Н)',
      words: ukrainian,
    },
  ])('should show the keys, the default in capitals: $frame', ({ defaultAnswer, frame, words }) => {
    // Arrange
    const tree = (
      <Confirm
        defaultAnswer={defaultAnswer}
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={mock()}
        words={words}
      />
    );

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe(frame);
  });

  it.each([
    {
      answer: true,
      key: 'y',
      words: englishWords,
    },
    {
      answer: true,
      key: 'Y',
      words: englishWords,
    },
    {
      answer: false,
      key: 'n',
      words: englishWords,
    },
    {
      answer: false,
      key: 'N',
      words: englishWords,
    },
    {
      answer: false,
      key: Key.Enter,
      words: englishWords,
    },
    {
      answer: true,
      key: 'т',
      words: ukrainian,
    },
    {
      answer: false,
      key: 'Н',
      words: ukrainian,
    },
  ])('should answer $answer when $key is pressed', async ({ answer, key, words }) => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        defaultAnswer={false}
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={onSubmit}
        words={words}
      />,
    );

    // Act
    await pressKeys(stdin, [
      key,
    ]);

    // Assert
    expect(onSubmit.mock.calls).toStrictEqual([
      [
        answer,
      ],
    ]);
  });

  it.each([
    {
      keys: [
        'x',
        'c',
        Key.CtrlA,
      ],
      words: englishWords,
    },
    {
      keys: [
        'y',
        'n',
      ],
      words: ukrainian,
    },
  ])('should neither answer nor interrupt when $keys are pressed', async ({ keys, words }) => {
    // Arrange
    const onSubmit = mock();
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        defaultAnswer
        message='Overwrite?'
        onInterrupt={onInterrupt}
        onSubmit={onSubmit}
        words={words}
      />,
    );

    // Act
    await pressKeys(stdin, keys);

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
        words={englishWords}
      />,
    );

    // Act
    await pressKeys(stdin, [
      Key.Interrupt,
    ]);

    // Assert
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      condition: 'its words are English',
      spoken: 'Overwrite?, yes or no',
      words: englishWords,
    },
    {
      condition: 'its words are Ukrainian',
      spoken: 'Overwrite?, Так або ні',
      words: ukrainian,
    },
  ])('should read out the question and its two answers when $condition', ({ spoken, words }) => {
    // Arrange
    const tree = (
      <Confirm
        defaultAnswer
        message='Overwrite?'
        onInterrupt={mock()}
        onSubmit={mock()}
        words={words}
      />
    );

    // Act
    const read = screenReaderOutputOf(tree);

    // Assert
    expect(read).toBe(spoken);
  });
});
