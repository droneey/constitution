import type { WiringPlan } from '../../../entities';
import type { PresetsPorts } from '../shared/presets-ports';
import { contextOf } from '../shared/wiring';
import { planWiringOf } from './steps/plan-wiring';

interface PlanPresetsInput extends PresetsPorts {
  readonly start: string;
}

/**
 * The configuration files the project's tools read, each with the units it serves, its template
 * and the parts it takes, as /ratify writes them.
 *
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const planPresets = (input: PlanPresetsInput): WiringPlan =>
  planWiringOf(
    contextOf({
      ...input.source.open(input.start),
      files: input.files,
      workingTree: input.workingTree,
    }),
  );

export { planPresets };
