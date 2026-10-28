import { StepStatus, Tone } from '@droneey/design-cli';

import type { Section, TaskOutcome } from '#/shared/cli';
import { countedNoteSections, countOf } from '#/shared/cli';

import type { ApplyPlan, ApplyReport, PresetsFinding, ProjectRead } from '../../domain/entities';
import { ApplyPlanKind, ProjectReadStatus } from '../../domain/entities';
import {
  ADDED_AFTER,
  DELETED_AFTER,
  FILE_NOUN,
  NOTE_NOUN,
  NOTED_AFTER,
  placeMessage,
  REMOVED_AFTER,
  SETTING_NOUN,
  WRITTEN_AFTER,
  writtenMessage,
} from './apply-report.messages';
import { findingLinesOf } from './finding-lines.utils';
import { FINDING_NOUN, FOUND_IN_PRESETS_AFTER } from './presets-finding-text.messages';
import { unreadOutcomeOf } from './project-unread.utils';

const foundSectionsOf = (findings: readonly PresetsFinding[]): readonly Section[] =>
  countedNoteSections({
    after: FOUND_IN_PRESETS_AFTER,
    lines: findingLinesOf(findings),
    noun: FINDING_NOUN,
    tone: Tone.Error,
  });

const writtenSectionsOf = ({
  notes,
  report,
}: {
  notes: readonly PresetsFinding[];
  report: ApplyReport;
}): readonly Section[] => [
  ...countedNoteSections({
    after: NOTED_AFTER,
    lines: findingLinesOf(notes),
    noun: NOTE_NOUN,
    tone: Tone.Warning,
  }),
  ...countedNoteSections({
    after: WRITTEN_AFTER,
    lines: report.writtenFilePaths,
    noun: FILE_NOUN,
    tone: Tone.Info,
  }),
  ...countedNoteSections({
    after: DELETED_AFTER,
    lines: report.deletedFilePaths,
    noun: FILE_NOUN,
    tone: Tone.Info,
  }),
  ...countedNoteSections({
    after: REMOVED_AFTER,
    lines: report.removed.map(placeMessage),
    noun: SETTING_NOUN,
    tone: Tone.Info,
  }),
  ...countedNoteSections({
    after: ADDED_AFTER,
    lines: report.added.map(placeMessage),
    noun: SETTING_NOUN,
    tone: Tone.Info,
  }),
];

/** Failed where the project cannot be read, or where the apply is held by its findings. */
const applyOutcomeOf = (read: ProjectRead<ApplyPlan>): TaskOutcome => {
  if (read.status !== ProjectReadStatus.Opened) {
    return unreadOutcomeOf(read);
  }

  const plan = read.answer;

  switch (plan.kind) {
    case ApplyPlanKind.Ready:
      return {
        detail: writtenMessage(
          countOf({
            count: plan.report.writtenFilePaths.length,
            noun: FILE_NOUN,
          }),
        ),
        status: StepStatus.Done,
      };
    case ApplyPlanKind.Held:
      return {
        detail: countOf({
          count: plan.findings.length,
          noun: FINDING_NOUN,
        }),
        status: StepStatus.Failed,
      };
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return plan satisfies never;
  }
};

/**
 * A ready apply shows what it noted and what it wrote; a held one wrote nothing, so it shows only
 * its findings.
 */
const applySectionsOf = (read: ProjectRead<ApplyPlan>): readonly Section[] => {
  if (read.status !== ProjectReadStatus.Opened) {
    return [];
  }

  const plan = read.answer;

  switch (plan.kind) {
    case ApplyPlanKind.Ready:
      return writtenSectionsOf(plan);
    case ApplyPlanKind.Held:
      return foundSectionsOf(plan.findings);
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return plan satisfies never;
  }
};

export { applyOutcomeOf, applySectionsOf };
