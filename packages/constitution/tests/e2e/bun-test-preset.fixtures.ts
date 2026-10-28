import type { ToolRun } from './preset-load.fixtures';
import { runTool, widestAppliedUnit } from './preset-load.fixtures';

enum BunConfig {
  Unit = 'bunfig.toml',
  Integration = 'bunfig.integration.toml',
  Mutation = 'bunfig.mutation.toml',
}

// The fixtures the presets write for the i18n and DOM libraries, whose packages this repository
// does not install, kept as empty modules: what is proven is that Bun loads them, not what they do.
const stubbed: Readonly<Record<string, string>> = {
  'package.json': '{ "name": "unit", "type": "module" }\n',
  'src/__tests__/dom.fixtures.ts': 'export {};\n',
  'src/__tests__/lingui.fixtures.ts': 'export {};\n',
};

const specOf = (body: string): string => `import { expect, test } from 'bun:test';\n\n${body}\n`;

interface BunTestInput {
  readonly config: BunConfig;
  readonly files: Readonly<Record<string, string>>;
}

/** A test run of Bun's, with the configuration given, in the widest unit that holds the files. */
const bunTestRun = (input: BunTestInput): Promise<ToolRun> =>
  runTool({
    command: [
      process.execPath,
      `--config=${input.config}`,
      'test',
    ],
    folder: widestAppliedUnit('bun-test', {
      files: {
        ...stubbed,
        ...input.files,
      },
    }),
  });

export { BunConfig, bunTestRun, specOf };
