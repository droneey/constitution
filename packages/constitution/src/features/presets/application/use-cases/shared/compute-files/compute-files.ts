import type { ProjectFiles } from '#/kernel/contracts';
import { AbsolutePath } from '#/kernel/value-objects';

import type { FileComputed, UnitComputed } from '../../../../domain/apply-plan/entities';
import type { FileAsked } from '../../../../domain/apply-plan/services';
import {
  beginFile,
  FileStepKind,
  finishFile,
  settleFile,
  unitComputedOf,
  unitFilesOf,
} from '../../../../domain/apply-plan/services';
import type { LockRead } from '../../../../domain/lock/entities';
import type { PresetsPlan } from '../../../../domain/presets-plan/entities';
import type { PresetsProject } from '../../../../domain/presets-project/entities';
import type { ConfigurationFormat } from '../../../contracts';

interface ComputeFilesInput {
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly lockOf: (unitFolderPath: AbsolutePath) => LockRead;
  readonly plan: PresetsPlan;
  readonly project: PresetsProject;
}

const computeFile = (input: {
  asked: FileAsked;
  files: ProjectFiles;
  formats: ConfigurationFormat;
  repositoryFolderPath: AbsolutePath;
}): FileComputed => {
  const { asked, formats } = input;
  const read = input.files.read(AbsolutePath.join(input.repositoryFolderPath, asked.filePath));
  const begun = beginFile({
    ...asked,
    read,
  });

  if (begun.kind === FileStepKind.Computed) {
    return begun.computed;
  }

  const settled = settleFile({
    ...asked,
    file: begun.file,
    parsed: formats.read(begun.file),
    read,
  });

  return settled.kind === FileStepKind.Computed
    ? settled.computed
    : finishFile(settled.pending, formats.write(settled.write));
};

const computeFiles = (input: ComputeFilesInput): readonly UnitComputed[] =>
  input.project.units.map((unit) => {
    const { repositoryFolderPath } = input.project;
    const unitFolderPath = AbsolutePath.join(repositoryFolderPath, unit.path);
    const read = input.lockOf(unitFolderPath);

    return unitComputedOf({
      files: unitFilesOf({
        plan: input.plan,
        read,
        unitPath: unit.path,
      }).map((asked) =>
        computeFile({
          ...input,
          asked,
          repositoryFolderPath,
        }),
      ),
      read,
      unitFolderPath,
      unitPath: unit.path,
    });
  });

export type { ComputeFilesInput };
export { computeFiles };
