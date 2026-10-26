import type { PresetsPlan, UnitRun } from '../../domain/entities';
import { PresetEntry } from '../../domain/entities';
import { findingLinesOf } from './presets-findings-report.utils';

const INDENT = '  ';

const runLinesOf = (run: UnitRun): readonly string[] => {
  const folder = String(run.unit);

  return [
    ...run.commands,
  ].flatMap(([name, commands]) => [
    `${folder === '' ? '' : `${folder}: `}run ${name}`,
    ...commands.map((command) => `${INDENT}${command}`),
  ]);
};

const planLinesOf = (plan: PresetsPlan): readonly string[] => [
  ...plan.files.flatMap((file) => [
    file.file,
    ...file.entries.map((entry) => `${INDENT}${PresetEntry.sourceOf(entry)}`),
  ]),
  ...plan.runs.flatMap(runLinesOf),
  ...findingLinesOf(plan.findings),
];

export { planLinesOf };
