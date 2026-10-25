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
  /** the project Claude Code names, '' when it names none */
  readonly projectDir: string;
}

interface CommandContext {
  readonly io: CommandIo;
  readonly places: CommandPlaces;
  readonly renderer: Renderer;
  /** ends the run with the code of a failure the user can act on, once the command is done */
  readonly setFailed: () => void;
  /** the examples of the command's common use, which its help opens with */
  readonly withExamples: <TCommand>(command: TCommand, examples: readonly string[]) => TCommand;
}

export type { CommandContext, CommandIo, CommandPlaces };
