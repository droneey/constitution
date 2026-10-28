import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRun } from '../entities';

interface SpecRunInput {
  readonly addedVariables: Readonly<Record<string, string>>;
  readonly signal: AbortSignal;
  readonly specPaths: readonly UnitRelativePath[];
  readonly timeoutMs: number;
}

interface SpecRunner {
  /**
   * @throws {SpecSettingsError} when the configuration of the specs is not of the shape their
   * runner reads
   */
  readonly findSpecPaths: () => readonly UnitRelativePath[];
  readonly run: (input: SpecRunInput) => Promise<SpecRun>;
}

export type { SpecRunInput, SpecRunner };
