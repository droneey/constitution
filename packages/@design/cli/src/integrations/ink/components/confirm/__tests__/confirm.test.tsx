import { describe, expect, it, mock } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { ConfirmWords } from '#/libs/ui';

import {
  englishWords,
  frameOf,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
} from '../../../__tests__/ink.fixtures';
import { Confirm } from '../confirm';

const ukrainian = ConfirmWords.create({
  no: 'ні',
  yes: 'Так',
});

describe('Confirm', () => {
  it('should draw and read out the question and its answers, the default in capitals and read out as checked, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'yes by default': frameOf(
        <Confirm
          isYesDefault
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={englishWords}
        />,
      ),
      'no by default': frameOf(
        <Confirm
          isYesDefault={false}
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={englishWords}
        />,
      ),
      'yes by default, in Ukrainian': frameOf(
        <Confirm
          isYesDefault
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={ukrainian}
        />,
      ),
      'no by default, in Ukrainian': frameOf(
        <Confirm
          isYesDefault={false}
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={ukrainian}
        />,
      ),
      'read out': screenReaderOutputOf(
        <Confirm
          isYesDefault
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={englishWords}
        />,
      ),
      'read out, no by default, in Ukrainian': screenReaderOutputOf(
        <Confirm
          isYesDefault={false}
          message='Overwrite?'
          onInterrupt={mock()}
          onSubmit={mock()}
          words={ukrainian}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('confirm.golden.txt', import.meta.url)));
  });

  it.each([
    {
      condition: 'the key of yes',
      answer: true,
      key: 'y',
      words: englishWords,
    },
    {
      condition: 'the key of yes in capitals',
      answer: true,
      key: 'Y',
      words: englishWords,
    },
    {
      condition: 'the key of no',
      answer: false,
      key: 'n',
      words: englishWords,
    },
    {
      condition: 'the key of no in capitals',
      answer: false,
      key: 'N',
      words: englishWords,
    },
    {
      condition: 'Enter, no being the default',
      answer: false,
      key: Key.Enter,
      words: englishWords,
    },
    {
      condition: 'the key of yes in Ukrainian',
      answer: true,
      key: 'т',
      words: ukrainian,
    },
    {
      condition: 'the key of no in Ukrainian, in capitals',
      answer: false,
      key: 'Н',
      words: ukrainian,
    },
  ])('should answer $answer when $condition is pressed', async ({ answer, key, words }) => {
    // Arrange
    const onSubmit = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        isYesDefault={false}
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
      condition: 'keys that are no answer, Ctrl with them or not, are pressed',
      keys: [
        'x',
        'c',
        Key.CtrlA,
      ],
      words: englishWords,
    },
    {
      condition: 'the English keys are pressed for Ukrainian words',
      keys: [
        'y',
        'n',
      ],
      words: ukrainian,
    },
  ])('should neither answer nor interrupt when $condition', async ({ keys, words }) => {
    // Arrange
    const onSubmit = mock();
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        isYesDefault
        message='Overwrite?'
        onInterrupt={onInterrupt}
        onSubmit={onSubmit}
        words={words}
      />,
    );

    // Act
    await pressKeys(stdin, keys);

    // Assert
    expect({
      interrupts: onInterrupt.mock.calls,
      submitted: onSubmit.mock.calls,
    }).toStrictEqual({
      interrupts: [],
      submitted: [],
    });
  });

  it('should interrupt when Ctrl-C is pressed', async () => {
    // Arrange
    const onInterrupt = mock();
    const { stdin } = renderWithTheme(
      <Confirm
        isYesDefault
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
});
