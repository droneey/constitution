import { PassThrough, Writable } from 'node:stream';

import type { ReactElement } from 'react';

import { render as renderToInk } from 'ink';
import { render } from 'ink-testing-library';

import type { Output } from '#/libs/ui';
import { ColourLevel, ConfirmWords, OutputMode, ThemeMode } from '#/libs/ui';

import { ThemeProvider } from '../components';

/** the keys a person presses, as a terminal sends them */
enum Key {
  Up = '\u001B[A',
  Down = '\u001B[B',
  Enter = '\r',
  Backspace = '\u007F',
  Interrupt = '\u0003',
  CtrlA = '\u0001',
}

const englishWords = ConfirmWords.create({
  locale: 'en',
  no: 'no',
  yes: 'yes',
});

const createPlainOutput = (overrides: Partial<Output> = {}): Output => ({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: OutputMode.Pretty,
  themeMode: ThemeMode.Dark,
  ...overrides,
});

interface Rendered {
  readonly frames: readonly string[];
  readonly lastFrame: () => string | undefined;
  readonly stdin: {
    readonly write: (keys: string) => void;
  };
  readonly unmount: () => void;
}

const renderWithTheme = (tree: ReactElement, output: Output = createPlainOutput()): Rendered => {
  const { frames, lastFrame, stdin, unmount } = render(
    <ThemeProvider output={output}>{tree}</ThemeProvider>,
  );

  return {
    frames,
    lastFrame,
    stdin,
    unmount,
  };
};

interface TerminalOutput extends Writable {
  readonly written: string[];
}

const createTerminalOutput = (): TerminalOutput => {
  const written: string[] = [];
  const output = new Writable({
    write: (chunk: Buffer, _encoding, done): void => {
      written.push(chunk.toString());
      done();
    },
  });

  return Object.assign(output, {
    columns: 80,
    // biome-ignore lint/style/useNamingConvention: Node.js names the property
    isTTY: true,
    written,
  });
};

interface TerminalInput extends PassThrough {
  /** whether the keys reach the program one by one, as Ink sets it while it reads them */
  isRaw: boolean;
}

const createTerminalInput = (): TerminalInput => {
  const input = Object.assign(new PassThrough(), {
    isRaw: false,
    // biome-ignore lint/style/useNamingConvention: Node.js names the property
    isTTY: true,
    ref: (): void => undefined,
    unref: (): void => undefined,
  });

  return Object.assign(input, {
    setRawMode: (isRaw: boolean): TerminalInput => {
      input.isRaw = isRaw;

      return input;
    },
  });
};

const screenReaderOutputOf = (tree: ReactElement): string => {
  const output = createTerminalOutput();
  const app = renderToInk(<ThemeProvider output={createPlainOutput()}>{tree}</ThemeProvider>, {
    debug: true,
    exitOnCtrlC: false,
    isScreenReaderEnabled: true,
    patchConsole: false,
    stdin: createTerminalInput(),
    stdout: output,
  });

  app.unmount();

  return output.written[0] ?? '';
};

const pressKeys = async (stdin: Rendered['stdin'], keys: readonly string[]): Promise<void> => {
  for (const key of keys) {
    stdin.write(key);
    // biome-ignore lint/performance/noAwaitInLoops: a key is pressed only once the last one's work is done
    await settle();
  }
};

const FRAME_DEADLINE_MS = 2000;

const frameOnceShown = async (
  lastFrame: () => string | undefined,
  text: string,
  deadline = performance.now() + FRAME_DEADLINE_MS,
): Promise<string | undefined> => {
  const frame = lastFrame();

  if (frame === text || performance.now() > deadline) {
    return frame;
  }

  await settle();

  return frameOnceShown(lastFrame, text, deadline);
};

/** lets the work a key started run to its end before the spec reads the frame */
const settle = (): Promise<void> =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

export {
  createPlainOutput,
  createTerminalInput,
  createTerminalOutput,
  englishWords,
  frameOnceShown,
  Key,
  pressKeys,
  renderWithTheme,
  screenReaderOutputOf,
  settle,
};
