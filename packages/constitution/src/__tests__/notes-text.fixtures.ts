import type { Section } from '#/shared/cli';
import { SectionKind } from '#/shared/cli';

type NoteSection = Extract<
  Section,
  {
    readonly kind: SectionKind.Note;
  }
>;

const isNote = (section: Section): section is NoteSection => section.kind === SectionKind.Note;

/** the notes of a report as its golden file shows them: each title over its lines, a blank line apart */
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
