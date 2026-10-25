import type { Version } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

const programReport = (program: Version): PartDiagnosis => ({
  kind: Diagnosis.ProgramRuns,
  program,
});

export { programReport };
