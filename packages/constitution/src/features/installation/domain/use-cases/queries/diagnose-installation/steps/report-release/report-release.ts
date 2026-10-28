import { Version } from '#/kernel/value-objects';

import type { LatestRelease, PartDiagnosis } from '../../../../../entities';
import { Diagnosis, ReleaseLookup } from '../../../../../entities';

interface ReportReleaseInput {
  readonly executable: Version;
  readonly latest: LatestRelease;
}

const reportRelease = (input: ReportReleaseInput): PartDiagnosis => {
  const { executable, latest } = input;

  switch (latest.lookup) {
    case ReleaseLookup.Found:
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
    case ReleaseLookup.Unanswered:
      return {
        kind: Diagnosis.LatestUnanswered,
        reason: latest.reason,
      };
    case ReleaseLookup.Refused:
      return {
        kind: Diagnosis.LatestRefused,
        status: latest.status,
      };
    case ReleaseLookup.Unreadable:
      return {
        kind: Diagnosis.LatestUnreadable,
      };
    // Stryker disable next-line ConditionalExpression: no lookup reaches the default, which only the compiler reads
    default:
      return latest satisfies never;
  }
};

export { reportRelease };
