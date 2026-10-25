import type { KeyValue, NoteContent, StepContent } from '@droneey/design-cli';

import { SectionKind } from '../constants';
import type { SectionOf } from '../types';

const linesSection = (lines: readonly string[]): SectionOf<SectionKind.Lines> => ({
  kind: SectionKind.Lines,
  lines,
});

const noteSection = (note: NoteContent): SectionOf<SectionKind.Note> => ({
  kind: SectionKind.Note,
  note,
});

const pairsSection = (pairs: readonly KeyValue[]): SectionOf<SectionKind.Pairs> => ({
  kind: SectionKind.Pairs,
  pairs,
});

const stepsSection = (steps: readonly StepContent[]): SectionOf<SectionKind.Steps> => ({
  kind: SectionKind.Steps,
  steps,
});

export { linesSection, noteSection, pairsSection, stepsSection };
