import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';

interface Analysis {
  readonly exitCode: number | undefined;
  readonly rules: readonly string[];
}

const yamllint = miseBinary('yamllint');
// A parsable line ends with the rule that reported it: `stdin:2:11: [error] … (octal-values)`.
const RULE_AT_END = /\(([a-z-]+)\)$/;

const analyseYaml = (text: string): Analysis => {
  const yamllintConfig = join(
    appliedUnit({
      implementations: [
        'yamllint',
      ],
      languages: [
        'yaml',
      ],
    }),
    '.yamllint.yaml',
  );
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
    ].toSorted((left, right) => left.localeCompare(right)),
  };
};

export { analyseYaml };
