import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import { mustOf } from '../../../__tests__/session.fixtures';
import type { RemindedBlock } from '../../../domain/entities';
import { reminderNotesOf } from '../reminder-notes.utils';

const NOTE_START = 'x governs a: read ';
const fullFile = 'f'.repeat(281);
const longFile = 'f'.repeat(282);
const wideFile = `�g${'é'.repeat(200)}`;

const blocksOf = (count: number): readonly RemindedBlock[] =>
  Array.from(
    {
      length: count,
    },
    (_, index) => ({
      files: [
        longFile,
      ],
      id: BlockId.create(`b${index}`),
      musts: [],
    }),
  );

describe('reminderNotesOf', () => {
  it('should name each block, its files and its MUST rules with the overrides that lower them', () => {
    // Arrange
    const reminder = {
      blocks: [
        {
          files: [
            'blocks/domains/ui/ui.md',
            'blocks/domains/ui/foundation/ui.md',
          ],
          id: BlockId.create('ui'),
          musts: [
            mustOf({
              block: 'ui',
              slug: 'one-screen',
            }),
            mustOf({
              block: 'ui',
              lowerings: [
                {
                  level: Level.Should,
                },
                {
                  level: Level.May,
                  unit: 'web',
                  via: 'labels-shown',
                },
              ],
              slug: 'labelled',
            }),
          ],
        },
        {
          files: [
            'blocks/contexts/languages/typescript/typescript.md',
          ],
          id: BlockId.create('typescript'),
          musts: [],
        },
      ],
      path: RepositoryRelativePath.create('src/ui/a.ts'),
    };

    // Act
    const notes = reminderNotesOf(reminder);

    // Assert
    expect(notes.lines).toStrictEqual([
      'ui governs src/ui/a.ts: read blocks/domains/ui/ui.md blocks/domains/ui/foundation/ui.md; its MUST rules: one-screen, labelled (SHOULD; MAY in web via labels-shown).',
      'typescript governs src/ui/a.ts: read blocks/contexts/languages/typescript/typescript.md.',
    ]);
  });

  it.each([
    {
      condition: 'the note fits its 300 bytes',
      file: fullFile,
      note: `${NOTE_START}${fullFile}.`,
    },
    {
      condition: 'the note is a byte too long',
      file: longFile,
      note: `${NOTE_START}${'f'.repeat(279)}...`,
    },
    {
      condition: 'the cut falls within a character',
      file: wideFile,
      note: `${NOTE_START}�g${'é'.repeat(137)}...`,
    },
  ])('should cut a note to 300 bytes when $condition', ({ file, note }) => {
    // Arrange
    const reminder = {
      blocks: [
        {
          files: [
            file,
          ],
          id: BlockId.create('x'),
          musts: [],
        },
      ],
      path: RepositoryRelativePath.create('a'),
    };

    // Act
    const notes = reminderNotesOf(reminder);

    // Assert
    expect(notes.lines).toStrictEqual([
      note,
    ]);
  });

  it.each([
    {
      condition: 'every note fits the budget',
      count: 9,
      shown: 9,
      lines: 9,
    },
    {
      condition: 'one note is past the budget',
      count: 10,
      shown: 9,
      lines: 10,
    },
    {
      condition: 'many notes are past the budget',
      count: 500,
      shown: 9,
      lines: 10,
    },
  ])(
    'should give the notes of the blocks that fit 3,000 bytes, and count the others, when $condition',
    ({ count, lines, shown }) => {
      // Arrange
      const reminder = {
        blocks: blocksOf(count),
        path: RepositoryRelativePath.create('a'),
      };

      // Act
      const notes = reminderNotesOf(reminder);

      // Assert
      expect({
        bytes: Buffer.byteLength(notes.lines.join('\n')) <= 3000,
        lines: notes.lines.length,
        shown: notes.shown.length,
      }).toStrictEqual({
        bytes: true,
        lines,
        shown,
      });
    },
  );

  it('should count the blocks the budget leaves out', () => {
    // Arrange
    const reminder = {
      blocks: blocksOf(500),
      path: RepositoryRelativePath.create('a'),
    };

    // Act
    const notes = reminderNotesOf(reminder);

    // Assert
    expect(notes.lines.at(-1)?.includes('491')).toBe(true);
  });
});
