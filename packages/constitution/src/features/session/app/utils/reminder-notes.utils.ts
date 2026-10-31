import type { LoweringPlace, MustRule } from '#/kernel/entities';
import type { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

import type { RemindedBlock, Reminder } from '../../domain/entities';
import { countedNoteOf, entriesWithin } from './bounded-list.utils';
import { capShareOf } from './hook-output.utils';
import { moreGoverningBlocksText } from './reminder-notes.messages';

const CAP_SHARES_PERCENT = {
  note: 3,
  notes: 30,
} as const;
const ELLIPSIS = '...';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Why: a note over its budget is cut at a byte, which can split a character: the decoder turns the
// split character's bytes into a replacement character, dropped before the ellipsis.
const fitted = (note: string): string => {
  const bytes = encoder.encode(note);
  const budget = capShareOf(CAP_SHARES_PERCENT.note);

  if (bytes.length <= budget) {
    return note;
  }

  return `${decoder.decode(bytes.slice(0, budget - ELLIPSIS.length)).replace(/�$/u, '')}${ELLIPSIS}`;
};

const loweringText = (lowering: LoweringPlace): string =>
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

interface ReminderNotes {
  readonly lines: readonly string[];
  readonly shown: readonly BlockId[];
}

const reminderNotesOf = (reminder: Reminder): ReminderNotes => {
  const noted = reminder.blocks.map((block) => ({
    id: block.id,
    note: noteOf({
      block,
      path: reminder.path,
    }),
  }));
  const shown = entriesWithin({
    budget: capShareOf(CAP_SHARES_PERCENT.notes),
    entries: noted,
    linesOf: (block) => [
      block.note,
    ],
  });

  return {
    lines: [
      ...shown.map((block) => block.note),
      ...countedNoteOf({
        count: noted.length - shown.length,
        note: moreGoverningBlocksText,
      }),
    ],
    shown: shown.map((block) => block.id),
  };
};

export { reminderNotesOf };
