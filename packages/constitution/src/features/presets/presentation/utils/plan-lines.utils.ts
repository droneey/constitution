import { UnitPath } from '#/kernel/value-objects';

import type { PresetsPlan, UnitRun } from '../../domain/entities';
import { PresetEntry } from '../../domain/entities';
import { findingLinesOf } from './finding-lines.utils';
import { indentedMessage, runMessage, unitRunMessage } from './plan-lines.messages';

const runLinesOf = (run: UnitRun): readonly string[] => {
  const { unitPath } = run;

  return [
    ...run.commands,
  ].flatMap(([entryPoint, commands]) => [
    UnitPath.isRepository(unitPath)
      ? runMessage(entryPoint)
      : unitRunMessage({
          entryPoint,
          unitPath,
        }),
    ...commands.map((command) => indentedMessage(command)),
  ]);
};

const planLinesOf = (plan: PresetsPlan): readonly string[] => [
  ...plan.files.flatMap((file) => [
    file.filePath,
    ...file.entries.map((entry) => indentedMessage(PresetEntry.sourceOf(entry))),
  ]),
  ...plan.runs.flatMap(runLinesOf),
  ...findingLinesOf(plan.findings),
];

export { planLinesOf };
