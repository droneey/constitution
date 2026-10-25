import type { ReactNode } from 'react';

import type { AccentTokens, Output } from '#/libs/ui';

import type { AnswerKind } from './terminal.constants';

/** the streams a view draws on and reads keys from: standard error and input for progress and questions */
interface TerminalStreams {
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
}

interface TerminalInput {
  /** the app's accent; the default theme's where none is given */
  readonly accent?: AccentTokens | undefined;
  readonly output: Output;
  readonly streams: TerminalStreams;
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

export type { Answer, TerminalInput, TerminalStreams, TerminalView };
