import type { AccentTokens, Output, OutputFlags, Theme } from '@droneey/design-cli';
import { chooseOutput, createTheme, OutputMode } from '@droneey/design-cli';

import type { CommandIo, Renderer, Report, Task } from '#/shared/cli';

import { createPlainRenderer } from './plain-renderer';

interface Streams {
  readonly stderr: NodeJS.WritableStream;
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
}

interface ClosableRenderer extends Renderer {
  readonly close: () => Promise<void>;
}

interface Presentation {
  readonly close: () => Promise<void>;
  readonly renderer: Renderer;
  readonly theme: () => Theme;
}

/**
 * The plain path never loads Ink; the terminal path loads it, and the screens, on its first step
 * or result.
 */
const createPresentation = (input: {
  accent: AccentTokens;
  env: Readonly<Record<string, string | undefined>>;
  flags: () => OutputFlags;
  io: CommandIo;
  isTerminal: boolean;
  streams: Streams;
}): Presentation => {
  let output: Output | undefined;
  let theme: Theme | undefined;
  let chosen: Promise<Renderer> | undefined;
  let terminal: Promise<ClosableRenderer> | undefined;

  const outputOf = (): Output => {
    output ??= chooseOutput({
      env: input.env,
      flags: input.flags(),
      isTerminal: input.isTerminal,
    });

    return output;
  };

  const themeOf = (): Theme => {
    const { colourLevel, isMotionReduced, themeMode } = outputOf();

    theme ??= createTheme({
      accent: input.accent,
      colourLevel,
      isMotionReduced,
      mode: themeMode,
    });

    return theme;
  };

  const terminalRendererOf = async (): Promise<ClosableRenderer> => {
    const { createTerminalRenderer } = await import('./terminal-renderer');

    return createTerminalRenderer({
      accent: input.accent,
      output: outputOf(),
      streams: input.streams,
      write: input.io.write,
    });
  };

  const choose = async (): Promise<Renderer> => {
    if (outputOf().mode === OutputMode.Plain) {
      return createPlainRenderer({
        io: input.io,
        theme: themeOf(),
      });
    }

    terminal = terminalRendererOf();

    return await terminal;
  };

  const rendererOf = async (): Promise<Renderer> => {
    chosen ??= choose();

    return await chosen;
  };

  return {
    close: async (): Promise<void> => {
      await (await terminal)?.close();
    },
    renderer: {
      print: async (report: Report): Promise<void> => {
        await (await rendererOf()).print(report);
      },
      run: async <TResult>(task: Task<TResult>): Promise<TResult> =>
        await (await rendererOf()).run(task),
    },
    theme: themeOf,
  };
};

export type { Streams };
export { createPresentation };
