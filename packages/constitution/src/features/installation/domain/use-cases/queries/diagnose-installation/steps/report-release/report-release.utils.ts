import { Version } from '#/kernel/value-objects';

import type { LatestRelease, PartDiagnosis } from '../../../../../entities';
import { Diagnosis, ReleaseLookup } from '../../../../../entities';

interface ReleaseReportInput {
  readonly executable: Version;
  readonly latest: LatestRelease;
}

const releaseReport = (input: ReleaseReportInput): PartDiagnosis => {
  const { executable, latest } = input;

  if (latest.lookup === ReleaseLookup.Unreachable) {
    return {
      kind: Diagnosis.LatestUnknown,
    };
  }

  return Version.compare(executable, latest.version) < 0
    ? {
        executable,
        kind: Diagnosis.LatestAhead,
        latest: latest.version,
      }
    : {
        kind: Diagnosis.LatestHeld,
        latest: latest.version,
      };
};

export { releaseReport };
