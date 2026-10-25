import { PROGRAM_NAME } from '#/kernel/constants';
import type { Version } from '#/kernel/value-objects';

import type { ProgramPath } from '../../../../../contracts';
import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

interface PathReportInput {
  readonly path: ProgramPath;
  readonly program: Version;
}

const pathReport = (input: PathReportInput): PartDiagnosis => {
  const found = input.path.find(PROGRAM_NAME);

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
