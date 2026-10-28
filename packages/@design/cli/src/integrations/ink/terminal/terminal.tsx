import type { ReactElement, ReactNode } from 'react';
import { StrictMode } from 'react';

import { render } from 'ink';

import type { AccentScale, ConfirmWords, Output } from '#/libs/ui';
import { createTheme } from '#/libs/ui';

import type { SelectProps } from '../components';
import { Confirm, Select, TextInput } from '../components';
import { ThemeContext } from '../theme';
import { AnswerKind } from './terminal.constants';

interface TerminalStreams {
  /** the stream the view is drawn on: standard error for progress and questions, standard output for a result */
  readonly screen: NodeJS.WritableStream;
  readonly stdin: NodeJS.ReadableStream;
}

interface TerminalInput {
  /** the app's accent; the default theme's where none is given */
  readonly accent?: AccentScale;
  readonly output: Output;
  readonly streams: TerminalStreams;
}

interface AskSelectInput<T> extends TerminalInput {
  readonly choices: SelectProps<T>['choices'];
  readonly message: string;
}

interface AskConfirmInput extends TerminalInput {
  readonly isYesDefault: boolean;
  readonly message: string;
  readonly words: ConfirmWords;
}

interface AskTextInput extends TerminalInput {
  readonly message: string;
  readonly placeholder: string;
}

/** a tree drawn on a terminal, redrawn by each `show`, and gone, the terminal restored, once closed */
interface TerminalView {
  readonly close: () => Promise<void>;
  readonly show: (tree: ReactNode) => void;
}

type Answer<T> =
  | {
      readonly kind: AnswerKind.Given;
      readonly value: T;
    }
  | {
      readonly kind: AnswerKind.Interrupted;
    };

/**
 * Ctrl-C reaches the tree as a key, never as Ink's own exit, so a question can end the run as interrupted.
 * The theme is made before Ink draws, since a failure inside Ink's render leaves a question unanswered.
 */
const openTerminalView = ({ output, streams, ...accentInput }: TerminalInput): TerminalView => {
  const theme = createTheme({
    ...accentInput,
    colourLevel: output.colourLevel,
    isMotionReduced: output.isMotionReduced,
    mode: output.themeMode,
  });

  const framed = (tree: ReactNode): ReactElement => (
    <StrictMode>
      <ThemeContext value={theme}>{tree}</ThemeContext>
    </StrictMode>
  );

  const inkInstance = render(framed(undefined), {
    exitOnCtrlC: false,
    // Stryker disable next-line BooleanLiteral: the program writes nothing to the console while a view is open
    patchConsole: false,
    stdin: streams.stdin,
    stdout: streams.screen,
  });

  return {
    close: async (): Promise<void> => {
      inkInstance.unmount();
      await inkInstance.waitUntilExit();
    },
    show: (tree: ReactNode): void => {
      inkInstance.rerender(framed(tree));
    },
  };
};

const ask = async <T,>({
  question,
  ...terminalInput
}: TerminalInput & {
  readonly question: (answer: (given: T) => void, interrupt: () => void) => ReactElement;
}): Promise<Answer<T>> => {
  const view = openTerminalView(terminalInput);

  try {
    return await new Promise<Answer<T>>((resolve) => {
      view.show(
        question(
          (given) =>
            resolve({
              kind: AnswerKind.Given,
              value: given,
            }),
          () =>
            resolve({
              kind: AnswerKind.Interrupted,
            }),
        ),
      );
    });
  } finally {
    await view.close();
  }
};

const askSelect = <T,>({
  choices,
  message,
  ...terminalInput
}: AskSelectInput<T>): Promise<Answer<T>> =>
  ask<T>({
    ...terminalInput,
    question: (answer, interrupt) => (
      <Select
        choices={choices}
        message={message}
        onInterrupt={interrupt}
        onSubmit={answer}
      />
    ),
  });

const askConfirm = ({
  isYesDefault,
  message,
  words,
  ...terminalInput
}: AskConfirmInput): Promise<Answer<boolean>> =>
  ask<boolean>({
    ...terminalInput,
    question: (answer, interrupt) => (
      <Confirm
        isYesDefault={isYesDefault}
        message={message}
        onInterrupt={interrupt}
        onSubmit={answer}
        words={words}
      />
    ),
  });

const askText = ({
  message,
  placeholder,
  ...terminalInput
}: AskTextInput): Promise<Answer<string>> =>
  ask<string>({
    ...terminalInput,
    question: (answer, interrupt) => (
      <TextInput
        message={message}
        onInterrupt={interrupt}
        onSubmit={answer}
        placeholder={placeholder}
      />
    ),
  });

export type {
  Answer,
  AskConfirmInput,
  AskSelectInput,
  AskTextInput,
  TerminalInput,
  TerminalStreams,
  TerminalView,
};
export { askConfirm, askSelect, askText, openTerminalView };
