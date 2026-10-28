import type { Section } from '#/shared/cli';
import { SectionKind } from '#/shared/cli';

type NoteSection = Extract<
  Section,
  {
    readonly kind: SectionKind.Note;
  }
>;

const isNote = (section: Section): section is NoteSection => section.kind === SectionKind.Note;

const notesTextOf = (sections: readonly Section[]): string =>
  sections
    .filter(isNote)
    .map(({ note }) =>
      [
        note.title,
        ...note.lines.map((line) => `  ${line}`),
      ].join('\n'),
    )
    .join('\n\n');

export { notesTextOf };
