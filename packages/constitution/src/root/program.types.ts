import type { AccentScale } from '@droneey/design-cli';

import type { SessionsPlace } from '#/features/session/adapters/session-store';
import type { CommandIo, CommandPlaces, ExitCode } from '#/shared/cli';

import type { Streams } from './presentation';

interface ProgramInput {
  readonly accent: AccentScale;
  readonly environment: {
    /** the folder Claude Code keeps its own files in */
    readonly claudeConfig: string;
    /** the environment git, lefthook and the programs on PATH run in */
    readonly commands: Readonly<Record<string, string>>;
    /** what the environment says of colour, motion and the terminal */
    readonly output: Readonly<Record<string, string | undefined>>;
    /** the plugin's folder, when Claude Code runs a hook from it */
    readonly pluginRoot: string | undefined;
    readonly sessions: SessionsPlace;
    /** the day the specs fix the clock at, YYYY-MM-DD; absent for the system's clock */
    readonly today?: string;
  };
  readonly fetch: (url: string, init: RequestInit) => Promise<Response>;
  readonly io: CommandIo;
  readonly isTerminal: boolean;
  readonly places: CommandPlaces;
  /** the fingerprint of the plugin's files this executable was built with, read when doctor asks */
  readonly pluginFingerprint: () => string | undefined;
  readonly streams: Streams;
  readonly version: string;
}

interface Program {
  /** the handler of last resort for a failure outside a run: writes it and gives its code */
  readonly fail: (error: unknown) => ExitCode;
  readonly run: (args: readonly string[]) => Promise<ExitCode>;
  /** ends whatever is still drawn, as an interrupt asks */
  readonly stop: () => Promise<void>;
}

export type { Program, ProgramInput };
