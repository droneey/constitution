import { StepStatus, Tone } from '@droneey/design-cli';

import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection } from '#/shared/cli';

import type { ApplyReport, SettingPlace } from '../../domain/entities';
import { findingLinesOf } from './presets-findings-report.utils';

const FINDING = 'finding';
const FILE = 'file';
const SETTING = 'setting';

const placeLine = (place: SettingPlace): string => `${place.file}: ${place.setting}`;

/** Failed where no project is, or where the apply found something wrong. */
const applyOutcomeOf = (report: ApplyReport | undefined): TaskOutcome => {
  if (report === undefined) {
    return {
      detail: 'no constitution.yaml in this folder or above it',
      status: StepStatus.Failed,
    };
  }

  const written = `${countOf({
    count: report.written.length,
    noun: FILE,
  })} written`;

  return report.findings.length === 0
    ? {
        detail: written,
        status: StepStatus.Done,
      }
    : {
        detail: `${written}, ${countOf({
          count: report.findings.length,
          noun: FINDING,
        })}`,
        status: StepStatus.Failed,
      };
};

const noteOf = (input: {
  lines: readonly string[];
  title: string;
  tone: Tone;
}): readonly Section[] =>
  input.lines.length === 0
    ? []
    : [
        noteSection(input),
      ];

const applySectionsOf = (report: ApplyReport | undefined): readonly Section[] =>
  report === undefined
    ? []
    : [
        ...noteOf({
          lines: report.written,
          title: `${countOf({
            count: report.written.length,
            noun: FILE,
          })} written`,
          tone: Tone.Info,
        }),
        ...noteOf({
          lines: report.deleted,
          title: `${countOf({
            count: report.deleted.length,
            noun: FILE,
          })} deleted, which the apply created and nothing holds any longer`,
          tone: Tone.Info,
        }),
        ...noteOf({
          lines: report.removed.map(placeLine),
          title: `${countOf({
            count: report.removed.length,
            noun: SETTING,
          })} removed, which no entry gives any longer`,
          tone: Tone.Info,
        }),
        ...noteOf({
          lines: report.added.map(placeLine),
          title: `${countOf({
            count: report.added.length,
            noun: SETTING,
          })} added as defaults to files that were there`,
          tone: Tone.Info,
        }),
        ...noteOf({
          lines: findingLinesOf(report.findings),
          title: `${countOf({
            count: report.findings.length,
            noun: FINDING,
          })} in the presets`,
          tone: Tone.Error,
        }),
      ];

export { applyOutcomeOf, applySectionsOf };
