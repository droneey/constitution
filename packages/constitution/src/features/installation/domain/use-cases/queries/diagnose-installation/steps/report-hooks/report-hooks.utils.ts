import type { GitHooks } from '../../../../../contracts';
import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis, HooksState } from '../../../../../entities';

const DIAGNOSIS_OF_STATE = {
  [HooksState.Installed]: Diagnosis.HooksInstalled,
  [HooksState.Missing]: Diagnosis.HooksMissing,
  [HooksState.Unavailable]: Diagnosis.HooksUnavailable,
  [HooksState.Unconfigured]: Diagnosis.HooksUnconfigured,
} as const satisfies Readonly<Record<HooksState, Diagnosis>>;

const hooksReport = (input: { hooks: GitHooks; project: string | undefined }): PartDiagnosis => ({
  kind:
    input.project === undefined
      ? Diagnosis.HooksWithoutProject
      : DIAGNOSIS_OF_STATE[input.hooks.stateOf(input.project)],
});

export { hooksReport };
