import type { Version } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

const executableReport = (executable: Version): PartDiagnosis => ({
  executable,
  kind: Diagnosis.ExecutableRuns,
});

export { executableReport };
