#!/usr/bin/env -S bun --no-env-file
import { homedir } from 'node:os';
import { join } from 'node:path';

import brand from '../../../brand.tokens.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
import { pluginFingerprintOf } from './libs/claude-plugin';
import { createProgram, ExitCode, TODAY_VARIABLE } from './root';

// The fingerprint of the plugin's files the build embeds; a run from the sources has none and takes
// its working tree's.
declare const CONSTITUTION_PLUGIN_FINGERPRINT: string | undefined;

const environmentOf = (names: readonly string[]): Readonly<Record<string, string>> =>
  Object.fromEntries(
    names.flatMap((name) => {
      const setting = process.env[name];

      return setting === undefined
        ? []
        : [
            [
              name,
              setting,
            ],
          ];
    }),
  );

const io = {
  readInput: async (): Promise<string> => await Bun.stdin.text(),
  write: (text: string): void => {
    process.stdout.write(text);
  },
  writeError: (text: string): void => {
    process.stderr.write(text);
  },
};

const today = process.env[TODAY_VARIABLE];

const program = createProgram({
  accent: brand,
  environment: {
    claudeConfig: process.env['CLAUDE_CONFIG_DIR'] ?? join(homedir(), '.claude'),
    commands: environmentOf([
      'PATH',
      'HOME',
      'XDG_CONFIG_HOME',
    ]),
    output: environmentOf([
      'CI',
      'COLORFGBG',
      'COLORTERM',
      'FORCE_COLOR',
      'NO_COLOR',
      'TERM',
    ]),
    pluginRoot: process.env['CLAUDE_PLUGIN_ROOT'],
    sessions: `/tmp/droneey-constitution-${String(process.getuid?.() ?? 0)}`,
    ...(today === undefined
      ? {}
      : {
          today,
        }),
  },
  fetch: globalThis.fetch,
  io,
  isTerminal: process.stdout.isTTY && process.stderr.isTTY,
  places: {
    cwd: process.cwd(),
    projectDir: process.env['CLAUDE_PROJECT_DIR'] ?? '',
  },
  pluginFingerprint: (): string | undefined =>
    typeof CONSTITUTION_PLUGIN_FINGERPRINT === 'string'
      ? CONSTITUTION_PLUGIN_FINGERPRINT
      : pluginFingerprintOf(join(import.meta.dir, '..')),
  streams: {
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
  },
  version: packageJson.version,
});

// An interrupt or a termination says it stops, restores the terminal within a bound and ends the
// run with the code the map gives the signal; a second one ends it at once.
const STOP_BOUND_MS = 2000;

for (const [signal, code] of [
  [
    'SIGINT',
    ExitCode.Interrupted,
  ],
  [
    'SIGTERM',
    ExitCode.Terminated,
  ],
] as const) {
  process.once(signal, (): void => {
    io.writeError(`constitution: stopping on ${signal}\n`);
    process.once(signal, (): void => {
      process.exit(code);
    });

    const exit = (): never => process.exit(code);

    Promise.race([
      program.stop(),
      Bun.sleep(STOP_BOUND_MS),
    ]).then(exit, exit);
  });
}

process.stdout.on('error', (error: NodeJS.ErrnoException): void => {
  if (error.code === 'EPIPE') {
    process.exit(ExitCode.ClosedPipe);
  }

  throw error;
});

process.exitCode = await program.run(process.argv.slice(2));
