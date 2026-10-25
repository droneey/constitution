import type { Renderer } from './renderer.types';

/**
 * The streams of a run: standard input, standard output for the result, standard error for the
 * rest.
 */
interface CommandIo {
  readonly readInput: () => Promise<string>;
  readonly write: (text: string) => void;
  readonly writeError: (text: string) => void;
}

interface CommandPlaces {
  readonly cwd: string;
  /** the project Claude Code names */
  readonly projectDir?: string;
}

interface CommandContext {
  /** the examples of a command's common use, as the text its help opens with, given to `addHelpText` */
  readonly helpExamples: (examples: readonly string[]) => () => string;
  readonly io: CommandIo;
  readonly places: CommandPlaces;
  readonly renderer: Renderer;
  /** ends the run with the code of a failure the user can act on, once the command is done */
  readonly setFailed: () => void;
}

export type { CommandContext, CommandIo, CommandPlaces };
