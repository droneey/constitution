import { EXECUTABLE_NAME } from '#/kernel/constants';
import type { Version } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../../domain/entities';
import { Diagnosis } from '../../../../../../domain/entities';
import type { ExecutablePath } from '../../../../../contracts';

interface ReportPathInput {
  readonly executable: Version;
  readonly path: ExecutablePath;
}

const reportPath = (input: ReportPathInput): PartDiagnosis => {
  const found = input.path.find(EXECUTABLE_NAME);

  if (found === undefined) {
    return {
      kind: Diagnosis.ExecutableNotOnPath,
    };
  }

  const answered = input.path.versionOf(found);

  if (answered === undefined) {
    return {
      kind: Diagnosis.PathSilent,
      path: found,
    };
  }

  return answered === input.executable
    ? {
        kind: Diagnosis.PathMatches,
        path: found,
      }
    : {
        answered,
        executable: input.executable,
        kind: Diagnosis.PathDiffers,
        path: found,
      };
};

export { reportPath };
