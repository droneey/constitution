import type { AccentScale } from '@droneey/design-cli';

import type { SessionsPlace } from '#/features/session/adapters/session-store';
import type { CommandIo, CommandPlaces, ExitCode } from '#/shared/cli';

import type { Streams } from './presentation';

interface ProgramInput {
  readonly accent: AccentScale;
  readonly environment: {
    readonly claudeConfig: string;
    readonly commands: Readonly<Record<string, string>>;
    readonly output: Readonly<Record<string, string | undefined>>;
    readonly pluginRoot: string | undefined;
    readonly sessions: SessionsPlace;
    readonly today?: string;
  };
  readonly fetch: (url: string, init: RequestInit) => Promise<Response>;
  readonly io: CommandIo;
  readonly isTerminal: boolean;
  readonly places: CommandPlaces;
  readonly pluginFingerprint: () => string | undefined;
  readonly streams: Streams;
  readonly version: string;
}

interface Program {
  readonly fail: (error: unknown) => ExitCode;
  readonly run: (args: readonly string[]) => Promise<ExitCode>;
  readonly stop: () => Promise<void>;
}

export type { Program, ProgramInput };
