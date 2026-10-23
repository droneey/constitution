#!/usr/bin/env -S bun --no-env-file
import packageJson from '../package.json' with { type: 'json' };
import { createProgram, ExitCode } from './root';

const program = await createProgram({
  environment: {
    git: Object.fromEntries(
      [
        'PATH',
        'HOME',
        'XDG_CONFIG_HOME',
      ].flatMap((name) => {
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
    ),
    sessions: `/tmp/droneey-constitution-${String(process.getuid?.() ?? 0)}`,
  },
  io: {
    readInput: async (): Promise<string> => await Bun.stdin.text(),
    write: (text: string): void => {
      process.stdout.write(text);
    },
    writeError: (text: string): void => {
      process.stderr.write(text);
    },
  },
  places: {
    cwd: process.cwd(),
    projectDir: process.env['CLAUDE_PROJECT_DIR'] ?? '',
  },
  setExitCode: (code: ExitCode): void => {
    process.exitCode = code;
  },
  version: packageJson.version,
});

// bunli ends its own usage failures — an unknown command or flag, a flag's bad value — with
// process.exit(1) before any handler starts; the map gives them the usage code.
process.on('exit', (code: number): void => {
  if (code === ExitCode.Failure && !program.errors.hasStarted()) {
    process.exitCode = ExitCode.Usage;
  }
});

// A run holds nothing to clean up — each write lands whole — so an interrupt or a termination ends
// it at once, with the code the map gives the signal.
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
    process.stderr.write(`constitution: stopping on ${signal}\n`);
    process.exit(code);
  });
}

await program.cli.run();
