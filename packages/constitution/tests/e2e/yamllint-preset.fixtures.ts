import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { miseBinary } from './mise.fixtures';

interface Analysis {
  readonly exitCode: number | undefined;
  readonly rules: readonly string[];
}

const repository = join(import.meta.dir, '..', '..');
const yamllintConfig = join(repository, 'presets', 'yaml', 'yamllint', 'foundation', 'self.yaml');
const yamllint = miseBinary('yamllint');
// A parsable line ends with the rule that reported it: `stdin:2:11: [error] … (octal-values)`.
const RULE_AT_END = /\(([a-z-]+)\)$/;

// The project extends the archive's configuration from .yamllint.yaml; the spec points at it.
const analyseYaml = (text: string): Analysis => {
  const run = spawnSync(
    yamllint,
    [
      '--format',
      'parsable',
      '--config-file',
      yamllintConfig,
      '-',
    ],
    {
      encoding: 'utf8',
      input: text,
    },
  );

  return {
    exitCode: run.status ?? undefined,
    rules: [
      ...new Set(run.stdout.split('\n').flatMap((line) => RULE_AT_END.exec(line)?.slice(1) ?? [])),
    ].toSorted(),
  };
};

export { analyseYaml };
