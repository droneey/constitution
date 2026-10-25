import { Version } from '#/kernel/value-objects';

import type { LatestRelease, PartDiagnosis } from '../../../../../entities';
import { Diagnosis, ReleaseLookup } from '../../../../../entities';

interface ReleaseReportInput {
  readonly latest: LatestRelease;
  readonly program: Version;
}

const releaseReport = (input: ReleaseReportInput): PartDiagnosis => {
  const { latest, program } = input;

  if (latest.lookup === ReleaseLookup.Unreachable) {
    return {
      kind: Diagnosis.LatestUnknown,
    };
  }

  return Version.compare(program, latest.version) < 0
    ? {
        kind: Diagnosis.LatestAhead,
        latest: latest.version,
        program,
      }
    : {
        kind: Diagnosis.LatestHeld,
        latest: latest.version,
      };
};

export { releaseReport };
