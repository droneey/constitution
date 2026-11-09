import { UnitPath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { ExitCode } from '#/shared/cli';

import type { ProjectRead } from '../../domain/presets-project/entities';
import { ProjectReadStatus } from '../../domain/presets-project/entities';
import type { CommandRan, CommandToRun, RunPlan } from '../../domain/run-plan/entities';
import { DiagnosticIndex } from '../../domain/run-plan/entities';
import { findingLinesOf } from './finding-lines.utils';
import { failUnreadStep } from './project-unread.utils';
import {
  brokenRuleMessage,
  lineMessage,
  stepFailedMessage,
  stepMessage,
  unitStepMessage,
} from './run-steps.messages';

interface RunStepsContext extends Pick<CommandContext, 'io' | 'renderer' | 'setFailed'> {
  readonly runCommand: (command: CommandToRun) => Promise<CommandRan>;
}

interface RunStepsInput {
  readonly isWhyShown: boolean;
  readonly read: ProjectRead<RunPlan>;
}

const runSteps = async (context: RunStepsContext, input: RunStepsInput): Promise<void> => {
  const { read } = input;

  if (read.status !== ProjectReadStatus.Opened) {
    await failUnreadStep(context, read);

    return;
  }

  const plan = read.answer;

  for (const line of findingLinesOf(plan.findings)) {
    context.io.writeError(lineMessage(line));
  }

  for (const step of plan.steps) {
    const { command, unitPath } = step;

    context.io.write(
      UnitPath.isRepository(unitPath)
        ? stepMessage(command)
        : unitStepMessage({
            command,
            unitPath,
          }),
    );

    // biome-ignore lint/performance/noAwaitInLoops: each command runs only once the one before it passed
    const { code, output } = await context.runCommand({
      command,
      folderPath: step.unitFolderPath,
    });

    if (code !== ExitCode.Success) {
      context.io.writeError(
        stepFailedMessage({
          code,
          command,
        }),
      );

      for (const rule of DiagnosticIndex.brokenIn(step.diagnostics, output)) {
        context.io.writeError(
          brokenRuleMessage({
            isWhyShown: input.isWhyShown,
            rule,
          }),
        );
      }

      context.setFailed();

      return;
    }
  }
};

export type { RunStepsContext };
export { runSteps };
