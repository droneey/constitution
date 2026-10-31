import type { Lowering, MustRule } from '#/kernel/entities';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

import type { RemindedBlock, Reminder } from '../../domain/reminder/entities';

const NOTE_BYTES = 300;
const ELLIPSIS = '...';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Why: a note over its budget is cut at a byte, which can split a character: the decoder turns the
// split character's bytes into a replacement character, dropped before the ellipsis.
const fitted = (note: string): string => {
  const bytes = encoder.encode(note);

  if (bytes.length <= NOTE_BYTES) {
    return note;
  }

  return `${decoder.decode(bytes.slice(0, NOTE_BYTES - ELLIPSIS.length)).replace(/�$/u, '')}${ELLIPSIS}`;
};

const loweringText = (lowering: Lowering): string =>
  `${lowering.level}${UnitPath.isRepository(lowering.unit) ? '' : ` in ${lowering.unit}`}${
    lowering.via === undefined ? '' : ` via ${lowering.via}`
  }`;

const mustText = (must: MustRule): string =>
  must.lowerings.length === 0
    ? must.slug
    : `${must.slug} (${must.lowerings.map(loweringText).join('; ')})`;

const noteOf = (input: { block: RemindedBlock; path: RepositoryRelativePath }): string => {
  const { block } = input;

  return fitted(
    `${block.id} governs ${input.path}: read ${block.files.join(' ')}${block.musts.length === 0 ? '' : `; its MUST rules: ${block.musts.map(mustText).join(', ')}`}.`,
  );
};

const reminderNotesOf = (reminder: Reminder): readonly string[] =>
  reminder.blocks.map((block) =>
    noteOf({
      block,
      path: reminder.path,
    }),
  );

export { reminderNotesOf };
