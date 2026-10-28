import type { ToolRun } from './preset-load.fixtures';
import { runTool, widestAppliedUnit } from './preset-load.fixtures';

enum BunConfig {
  Unit = 'bunfig.toml',
  Integration = 'bunfig.integration.toml',
  Mutation = 'bunfig.mutation.toml',
}

// Why: this repository does not install the i18n and DOM libraries, so their fixtures are empty
// modules: what is proven is that Bun loads them, not what they do.
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
