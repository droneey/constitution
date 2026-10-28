import { PassThrough, Writable } from 'node:stream';

import type { ReactElement } from 'react';

import { render as renderToInk } from 'ink';
import { render } from 'ink-testing-library';

import { createPlainTheme } from '#/__tests__/theme.fixtures';
import type { Output, Theme } from '#/libs/ui';
import { ColourLevel, ConfirmWords, OutputMode, StepStatus, ThemeMode } from '#/libs/ui';

import { ThemeContext } from '../theme';

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
  no: 'no',
  yes: 'yes',
});

/** what a screen reader says for each status, worded unlike the statuses so a spec tells them apart */
const STATUS_LABELS = {
  [StepStatus.Pending]: 'waiting',
  [StepStatus.Running]: 'working',
  [StepStatus.Done]: 'finished',
  [StepStatus.Failed]: 'broken',
  [StepStatus.Warned]: 'flagged',
  [StepStatus.Skipped]: 'omitted',
} as const satisfies Readonly<Record<StepStatus, string>>;

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
  readonly rerender: (tree: ReactElement) => void;
  readonly stdin: {
    readonly write: (keys: string) => void;
  };
  readonly unmount: () => void;
}

const renderWithTheme = (tree: ReactElement, theme: Theme = createPlainTheme()): Rendered => {
  const themed = (shown: ReactElement): ReactElement => (
    <ThemeContext value={theme}>{shown}</ThemeContext>
  );

  const { frames, lastFrame, rerender, stdin, unmount } = render(themed(tree));

  return {
    frames,
    lastFrame,
    rerender: (shown: ReactElement): void => {
      rerender(themed(shown));
    },
    stdin,
    unmount,
  };
};

/** the last frame a tree draws, the tree taken off again so nothing it starts outlives it */
const frameOf = (tree: ReactElement, theme?: Theme): string | undefined => {
  const { lastFrame, unmount } = renderWithTheme(tree, theme);
  const frame = lastFrame();

  unmount();

  return frame;
};

interface TerminalOutput extends Writable {
  readonly written: string[];
}

const createTerminalOutput = (): TerminalOutput => {
  const written: string[] = [];
  const output = new Writable({
    write: (chunk: Buffer, _encoding, done): void => {
      written.push(chunk.toString('utf8'));
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

interface FakeKeyboard extends PassThrough {
  /** whether the keys reach the program one by one, as Ink sets it while it reads them */
  isRaw: boolean;
}

const createFakeKeyboard = (): FakeKeyboard => {
  const input = Object.assign(new PassThrough(), {
    isRaw: false,
    // biome-ignore lint/style/useNamingConvention: Node.js names the property
    isTTY: true,
    ref: (): void => undefined,
    unref: (): void => undefined,
  });

  return Object.assign(input, {
    setRawMode: (isRaw: boolean): FakeKeyboard => {
      input.isRaw = isRaw;

      return input;
    },
  });
};

const screenReaderOutputOf = (tree: ReactElement): string => {
  const output = createTerminalOutput();
  const app = renderToInk(<ThemeContext value={createPlainTheme()}>{tree}</ThemeContext>, {
    debug: true,
    exitOnCtrlC: false,
    isScreenReaderEnabled: true,
    patchConsole: false,
    stdin: createFakeKeyboard(),
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

interface ShownFrame {
  readonly frame: string | undefined;
  /** since the wait began */
  readonly shownAfterMs: number;
}

/** the frame once it shows the text, or the last one drawn by the deadline */
const frameOnceShown = async (
  lastFrame: () => string | undefined,
  text: string,
  startedAt = performance.now(),
): Promise<ShownFrame> => {
  const frame = lastFrame();
  const shownAfterMs = performance.now() - startedAt;

  if (frame === text || shownAfterMs > FRAME_DEADLINE_MS) {
    return {
      frame,
      shownAfterMs,
    };
  }

  await settle();

  return frameOnceShown(lastFrame, text, startedAt);
};

/** lets the work a key started run to its end before the spec reads the frame */
const settle = (): Promise<void> =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

export {
  createFakeKeyboard,
  createPlainOutput,
  createTerminalOutput,
  englishWords,
  frameOf,
  frameOnceShown,
  Key,
  pressKeys,
  renderWithTheme,
  STATUS_LABELS,
  screenReaderOutputOf,
  settle,
};
