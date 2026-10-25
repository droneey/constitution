#!/usr/bin/env -S bun --no-env-file
import { homedir } from 'node:os';
import { join } from 'node:path';

import brand from '../../../brand.tokens.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
import { readTextWithin } from './libs/bounded-input';
import { pluginFingerprintOf } from './libs/claude-plugin';
import { createProgram, TODAY_VARIABLE } from './root';
import { ExitCode } from './shared/cli';

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

// A hook's event is a few kilobytes, a file an agent wrote among them at most; an input past this
// is refused unread, and reads as no event.
const MAX_INPUT_BYTES = 67_108_864;

const io = {
  readInput: async (): Promise<string> =>
    (await readTextWithin({
      maxBytes: MAX_INPUT_BYTES,
      stream: Bun.stdin.stream(),
    })) ?? '',
  write: (text: string): void => {
    process.stdout.write(text);
  },
  writeError: (text: string): void => {
    process.stderr.write(text);
  },
};

const today = process.env[TODAY_VARIABLE];
const projectDir = process.env['CLAUDE_PROJECT_DIR'];

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
    sessions: {
      environment: environmentOf([
        'HOME',
        'XDG_STATE_HOME',
      ]),
      formerFolder: `/tmp/droneey-constitution-${String(process.getuid?.() ?? 0)}`,
      owner: process.geteuid?.(),
    },
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
    ...(projectDir === undefined || projectDir === ''
      ? {}
      : {
          projectDir,
        }),
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

// A closed pipe ends the run with its code; any other failure of standard output goes to the
// handler of last resort, which writes it and gives its code.
process.stdout.on('error', (error: NodeJS.ErrnoException): void => {
  process.exit(error.code === 'EPIPE' ? ExitCode.ClosedPipe : program.fail(error));
});

process.exitCode = await program.run(process.argv.slice(2));
