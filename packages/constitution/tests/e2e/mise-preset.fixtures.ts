import { join } from 'node:path';

import { linesOf, runTool, widestAppliedUnit } from './preset-load.fixtures';

interface ConfigRead {
  readonly isConfigListed: boolean;
  readonly status: number;
  readonly unknownFields: readonly string[];
}

// Why: mise warns of a key of its configuration it does not know, and goes on without it.
const UNKNOWN_FIELD = /unknown field/;
const CONFIG_FILE = 'mise.toml';
const MISE_HOME = '.mise-home';

const configReadOf = async (reader: string): Promise<ConfigRead> => {
  const folder = widestAppliedUnit(reader);
  const run = await runTool({
    command: [
      'mise',
      'config',
      'ls',
    ],
    // Why: mise reads a configuration only once it is trusted, and a temporary folder never is.
    // Why: the folders of mise's own configuration and state sit in the unit, so the machine's
    // global configuration stays out of what the spec reads.
    env: new Map([
      [
        'MISE_TRUSTED_CONFIG_PATHS',
        folder,
      ],
      [
        'MISE_CONFIG_DIR',
        join(folder, MISE_HOME, 'config'),
      ],
      [
        'MISE_GLOBAL_CONFIG_FILE',
        join(folder, MISE_HOME, 'config', CONFIG_FILE),
      ],
      [
        'MISE_STATE_DIR',
        join(folder, MISE_HOME, 'state'),
      ],
      [
        'MISE_CACHE_DIR',
        join(folder, MISE_HOME, 'cache'),
      ],
    ]),
    folder,
  });

  return {
    isConfigListed: linesOf(run.stdout).some((line) => line.includes(CONFIG_FILE)),
    status: run.status,
    unknownFields: linesOf(run.stderr).filter((line) => UNKNOWN_FIELD.test(line)),
  };
};

export { configReadOf };
