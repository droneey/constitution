import type { AbsolutePath } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../../domain/entities';
import { Diagnosis, HooksState } from '../../../../../../domain/entities';
import type { GitHooks } from '../../../../../contracts';

const DIAGNOSIS_OF_STATE = {
  [HooksState.Installed]: Diagnosis.HooksInstalled,
  [HooksState.Missing]: Diagnosis.HooksMissing,
  [HooksState.Unavailable]: Diagnosis.HooksUnavailable,
  [HooksState.Unconfigured]: Diagnosis.HooksUnconfigured,
} as const satisfies Readonly<Record<HooksState, Diagnosis>>;

interface ReportHooksInput {
  readonly hooks: GitHooks;
  readonly repositoryFolderPath: AbsolutePath | undefined;
}

const reportHooks = (input: ReportHooksInput): PartDiagnosis => ({
  kind:
    input.repositoryFolderPath === undefined
      ? Diagnosis.HooksWithoutProject
      : DIAGNOSIS_OF_STATE[input.hooks.stateOf(input.repositoryFolderPath)],
});

export { reportHooks };
