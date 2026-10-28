import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { nodeBinary } from './package.fixtures';
import { linesOf, runTool, widestAppliedUnit } from './preset-load.fixtures';

interface Scan {
  /** the lines jscpd prints on a configuration it cannot take */
  readonly refusals: readonly string[];
  /** the files jscpd reads */
  readonly sources: number;
  readonly status: number;
}

const report = z.object({
  statistics: z.object({
    total: z.object({
      sources: z.number(),
    }),
  }),
});

const REPORT_FOLDER = '.jscpd-report';
// jscpd only prints a key it does not know, as `config file .jscpd.json: unknown field '<key>'`,
// and still ends 0.
const CONFIG_REFUSAL = /^config file /;

/** jscpd's scan of the widest unit, which holds the files given, read from its JSON report. */
const scanOf = async (files: Readonly<Record<string, string>>): Promise<Scan> => {
  const folder = widestAppliedUnit('jscpd', {
    files,
  });
  const run = await runTool({
    command: [
      nodeBinary('jscpd'),
      '--silent',
      '--reporters',
      'json',
      '--output',
      REPORT_FOLDER,
    ],
    folder,
  });

  return {
    refusals: linesOf(`${run.stdout}${run.stderr}`).filter((line) => CONFIG_REFUSAL.test(line)),
    sources: report.parse(
      JSON.parse(readFileSync(join(folder, REPORT_FOLDER, 'jscpd-report.json'), 'utf8')),
    ).statistics.total.sources,
    status: run.status,
  };
};

export { scanOf };
