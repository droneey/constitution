import type { ReactElement, ReactNode } from 'react';
import { StrictMode } from 'react';

import { render } from 'ink';

import { Confirm, Select, TextInput, ThemeProvider } from '../components';
import { AnswerKind } from './terminal.constants';
import type {
  Answer,
  AskConfirmInput,
  AskSelectInput,
  AskTextInput,
  TerminalInput,
  TerminalView,
} from './terminal.types';

/** Ctrl-C reaches the tree as a key, never as Ink's own exit, so a question can end the run as interrupted. */
const openTerminalView = ({ accent, output, streams }: TerminalInput): TerminalView => {
  const framed = (tree: ReactNode): ReactElement => (
    <StrictMode>
      <ThemeProvider
        accent={accent}
        output={output}
      >
        {tree}
      </ThemeProvider>
    </StrictMode>
  );

  const instance = render(framed(undefined), {
    exitOnCtrlC: false,
    // Stryker disable next-line BooleanLiteral: the program writes nothing to the console while a view is open
    patchConsole: false,
    stdin: streams.stdin,
    stdout: streams.stdout,
  });

  return {
    close: async (): Promise<void> => {
      instance.unmount();
      await instance.waitUntilExit();
    },
    show: (tree: ReactNode): void => {
      instance.rerender(framed(tree));
    },
  };
};

const ask = async <T,>(
  input: TerminalInput & {
    question: (answer: (given: T) => void, interrupt: () => void) => ReactElement;
  },
): Promise<Answer<T>> => {
  const view = openTerminalView(input);

  try {
    return await new Promise<Answer<T>>((resolve) => {
      view.show(
        input.question(
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

const askSelect = <T,>(input: AskSelectInput<T>): Promise<Answer<T>> =>
  ask<T>({
    ...input,
    question: (answer, interrupt) => (
      <Select
        choices={input.choices}
        message={input.message}
        onInterrupt={interrupt}
        onSubmit={answer}
      />
    ),
  });

const askConfirm = (input: AskConfirmInput): Promise<Answer<boolean>> =>
  ask<boolean>({
    ...input,
    question: (answer, interrupt) => (
      <Confirm
        defaultAnswer={input.defaultAnswer}
        message={input.message}
        onInterrupt={interrupt}
        onSubmit={answer}
        words={input.words}
      />
    ),
  });

const askText = (input: AskTextInput): Promise<Answer<string>> =>
  ask<string>({
    ...input,
    question: (answer, interrupt) => (
      <TextInput
        message={input.message}
        onInterrupt={interrupt}
        onSubmit={answer}
        placeholder={input.placeholder}
      />
    ),
  });

export { askConfirm, askSelect, askText, openTerminalView };
