import type { AccentScale, Output, OutputFlags, Theme } from '@droneey/design-cli';
import { chooseOutput, createTheme, OutputMode } from '@droneey/design-cli';

import type { CommandIo, Renderer, Report, Task } from '#/shared/cli';

import { createPlainRenderer } from './plain-renderer';
import type { Streams, TerminalRenderer } from './terminal-renderer';

interface Presentation {
  readonly close: () => Promise<void>;
  readonly renderer: Renderer;
  readonly theme: () => Theme;
}

interface PresentationInput {
  readonly accent: AccentScale;
  readonly env: Readonly<Record<string, string | undefined>>;
  /** @throws {UsageError} when the options do not parse */
  readonly flags: () => OutputFlags;
  readonly io: CommandIo;
  readonly isTerminal: boolean;
  readonly streams: Streams;
}

// Why: the plain path never loads Ink; the terminal path loads it, and the screens, on its first
// step or result.
const createPresentation = (input: PresentationInput): Presentation => {
  let output: Output | undefined;
  let theme: Theme | undefined;
  let chosen: Promise<Renderer> | undefined;
  let terminal: Promise<TerminalRenderer> | undefined;

  /** @throws {UsageError} when the options do not parse */
  const outputOf = (): Output => {
    output ??= chooseOutput({
      env: input.env,
      flags: input.flags(),
      isTerminal: input.isTerminal,
    });

    return output;
  };

  /** @throws {UsageError} when the options do not parse */
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

  /** @throws {UsageError} when the options do not parse */
  const terminalRendererOf = async (): Promise<TerminalRenderer> => {
    const { createTerminalRenderer } = await import('./terminal-renderer');

    return createTerminalRenderer({
      accent: input.accent,
      output: outputOf(),
      streams: input.streams,
      write: input.io.write,
    });
  };

  /** @throws {UsageError} when the options do not parse */
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

  /** @throws {UsageError} when the options do not parse */
  const rendererOf = async (): Promise<Renderer> => {
    chosen ??= choose();

    return await chosen;
  };

  return {
    close: async (): Promise<void> => {
      await (await terminal)?.close();
    },
    renderer: {
      /** @throws {UsageError} when the options do not parse */
      print: async (report: Report): Promise<void> => {
        await (await rendererOf()).print(report);
      },
      /** @throws {UsageError} when the options do not parse */
      run: async <TResult>(task: Task<TResult>): Promise<TResult> =>
        await (await rendererOf()).run(task),
    },
    theme: themeOf,
  };
};

export type { Streams } from './terminal-renderer';
export { createPresentation };
