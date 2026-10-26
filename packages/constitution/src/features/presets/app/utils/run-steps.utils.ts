import type { CommandIo } from '#/shared/cli';

import type { RunPlan, RunStep } from '../../domain/entities';
import { findingLinesOf } from './presets-findings-report.utils';

interface RunStepsContext {
  readonly io: CommandIo;
  readonly runCommand: (step: RunStep) => number;
  readonly setFailed: () => void;
}

const runSteps = (context: RunStepsContext, plan: RunPlan): void => {
  for (const line of findingLinesOf(plan.findings)) {
    context.io.writeError(`${line}\n`);
  }

  for (const step of plan.steps) {
    const unit = String(step.unit);

    context.io.write(`$ ${unit === '' ? '' : `(${unit}) `}${step.command}\n`);

    const code = context.runCommand(step);

    if (code !== 0) {
      context.io.writeError(`${step.command} ended with code ${String(code)}\n`);
      context.setFailed();

      return;
    }
  }
};

export type { RunStepsContext };
export { runSteps };
