import { PassThrough, Writable } from 'node:stream';

import type { ReactElement } from 'react';

import type { Output } from '@droneey/design-cli';
import { ColourLevel, OutputMode, ThemeMode } from '@droneey/design-cli';
import { ThemeProvider } from '@droneey/design-cli/ink';
import { render } from 'ink';

/** a terminal's output with no colour and no motion, the fields a case is about overridden */
const createPlainOutput = (overrides: Partial<Output> = {}): Output => ({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: OutputMode.Pretty,
  themeMode: ThemeMode.Dark,
  ...overrides,
});

/** what Ink says of a tree to a screen reader, its first frame in place of its drawing */
const screenReaderOutputOf = (tree: ReactElement): string => {
  const written: string[] = [];
  const screen = new Writable({
    write: (chunk: Buffer, _encoding, done): void => {
      written.push(chunk.toString());
      done();
    },
  });
  const app = render(<ThemeProvider output={createPlainOutput()}>{tree}</ThemeProvider>, {
    debug: true,
    exitOnCtrlC: false,
    isScreenReaderEnabled: true,
    patchConsole: false,
    stdin: new PassThrough(),
    stdout: screen,
  });

  app.unmount();

  return written[0] ?? '';
};

export { createPlainOutput, screenReaderOutputOf };
