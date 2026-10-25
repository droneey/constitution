import type { KeyValue, NoteContent, StepContent } from '@droneey/design-cli';

import type { SectionKind } from '../constants';

type Section =
  | {
      readonly kind: SectionKind.Lines;
      readonly lines: readonly string[];
    }
  | {
      readonly kind: SectionKind.Note;
      readonly note: NoteContent;
    }
  | {
      readonly kind: SectionKind.Pairs;
      readonly pairs: readonly KeyValue[];
    }
  | {
      readonly kind: SectionKind.Steps;
      readonly steps: readonly StepContent[];
    };

type SectionOf<TKind extends SectionKind> = Extract<
  Section,
  {
    readonly kind: TKind;
  }
>;

type Report = readonly Section[];

export type { Report, Section, SectionOf };
