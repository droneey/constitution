import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRun } from '../entities';

interface SpecRunInput {
  readonly signal: AbortSignal;
  readonly specPaths: readonly UnitRelativePath[];
  readonly timeoutMs: number;
  /** the variables the specs run with beside those of the environment the runner passes on */
  readonly variables: Readonly<Record<string, string>>;
}

interface SpecRunner {
  /** @throws SpecSettingsError when the configuration of the specs is not of the shape their runner reads */
  readonly findSpecPaths: () => readonly UnitRelativePath[];
  readonly run: (input: SpecRunInput) => Promise<SpecRun>;
}

export type { SpecRunInput, SpecRunner };
