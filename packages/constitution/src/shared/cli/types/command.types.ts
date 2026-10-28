import type { HelpExamples } from '#/libs/commander';

import type { Renderer } from './renderer.types';

interface CommandIo {
  readonly readInput: () => Promise<string>;
  readonly write: (text: string) => void;
  readonly writeError: (text: string) => void;
}

interface CommandPlaces {
  readonly cwd: string;
  readonly projectDir?: string;
}

interface CommandContext {
  readonly helpExamples: HelpExamples;
  readonly io: CommandIo;
  readonly places: CommandPlaces;
  readonly renderer: Renderer;
  readonly setFailed: () => void;
}

export type { CommandContext, CommandIo, CommandPlaces };
