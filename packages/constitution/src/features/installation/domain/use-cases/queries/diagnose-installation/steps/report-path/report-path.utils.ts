import type { Version } from '#/kernel/value-objects';

import type { ProgramPath } from '../../../../../contracts';
import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

const PROGRAM = 'constitution';

const pathReport = (input: { path: ProgramPath; program: Version }): PartDiagnosis => {
  const found = input.path.find(PROGRAM);

  if (found === undefined) {
    return {
      kind: Diagnosis.ProgramNotOnPath,
    };
  }

  const answered = input.path.versionOf(found);

  if (answered === undefined) {
    return {
      kind: Diagnosis.PathSilent,
      path: found,
    };
  }

  return answered === input.program
    ? {
        kind: Diagnosis.PathMatches,
        path: found,
      }
    : {
        answered,
        kind: Diagnosis.PathDiffers,
        path: found,
        program: input.program,
      };
};

export { pathReport };
