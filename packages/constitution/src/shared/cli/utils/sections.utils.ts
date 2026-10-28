import type { NoteContent, StepContent, Tone } from '@droneey/design-cli';

import { SectionKind } from '../constants';
import type { Section, SectionOf } from '../types';
import { countOf } from './count.utils';

interface CountedNote {
  /** what the title says after the count of the lines */
  readonly after: string;
  readonly lines: readonly string[];
  /** what each line is */
  readonly noun: string;
  readonly tone: Tone;
}

const linesSection = (lines: readonly string[]): SectionOf<SectionKind.Lines> => ({
  kind: SectionKind.Lines,
  lines,
});

const noteSection = (note: NoteContent): SectionOf<SectionKind.Note> => ({
  kind: SectionKind.Note,
  note,
});

const stepsSection = (steps: readonly StepContent[]): SectionOf<SectionKind.Steps> => ({
  kind: SectionKind.Steps,
  steps,
});

/** The sections of a counted note: none where no line is. */
const countedNoteSections = (note: CountedNote): readonly Section[] =>
  note.lines.length === 0
    ? []
    : [
        noteSection({
          lines: note.lines,
          title: `${countOf({
            count: note.lines.length,
            noun: note.noun,
          })} ${note.after}`,
          tone: note.tone,
        }),
      ];

export { countedNoteSections, linesSection, noteSection, stepsSection };
