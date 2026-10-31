import { describe, expect, it } from 'bun:test';

import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { HotReminder, HotRule } from '../../../../../domain/entities';
import { hotHeadingMessage, hotRuleLineMessage, leftOutFilesText } from '../hot-list.messages';
import { hotListLines } from '../hot-list.utils';

const commentRule: HotRule = {
  firstSentence: 'A comment states what is left.',
  slug: RuleSlug.create('comment-explains-why'),
};

const nameRule: HotRule = {
  firstSentence: 'A name is never only an empty word.',
  slug: RuleSlug.create('name-never-an-empty-word'),
};

const reminderOf = (input: { path: string; rules: readonly HotRule[] }): HotReminder => ({
  path: AbsolutePath.create(input.path),
  rules: input.rules,
});

const longSentence = `${'A rule whose first sentence runs long. '.repeat(25)}End.`;

const manyOf = (input: { count: number; rules: readonly HotRule[] }): readonly HotReminder[] =>
  Array.from(
    {
      length: input.count,
    },
    (_, index) =>
      reminderOf({
        path: `/work/src/file-${String(index).padStart(6, '0')}.ts`,
        rules: input.rules,
      }),
  );

const setsOf = (count: number): readonly HotReminder[] =>
  Array.from(
    {
      length: count,
    },
    (_, index) =>
      reminderOf({
        path: `/work/src/${index}.ts`,
        rules: [
          {
            firstSentence: `${longSentence} ${index}`,
            slug: RuleSlug.create('comment-explains-why'),
          },
          {
            firstSentence: longSentence,
            slug: RuleSlug.create('name-never-an-empty-word'),
          },
        ],
      }),
  );

describe('hotListLines', () => {
  it('should name the files of one set of hot rules once, then each rule of the set', () => {
    // Arrange
    const reminders = [
      reminderOf({
        path: '/work/src/a.ts',
        rules: [
          commentRule,
          nameRule,
        ],
      }),
      reminderOf({
        path: '/work/src/b.ts',
        rules: [
          commentRule,
        ],
      }),
      reminderOf({
        path: '/work/src/c.ts',
        rules: [
          commentRule,
          nameRule,
        ],
      }),
    ];

    // Act
    const lines = hotListLines(reminders);

    // Assert
    expect(lines).toStrictEqual([
      hotHeadingMessage('/work/src/a.ts, /work/src/c.ts'),
      hotRuleLineMessage(commentRule),
      hotRuleLineMessage(nameRule),
      hotHeadingMessage('/work/src/b.ts'),
      hotRuleLineMessage(commentRule),
    ]);
  });

  it.each([
    {
      condition: 'the paths fill their share to the byte',
      count: 40,
      firstLeftOut: '/work/src/file-000040.ts',
      lastNamed: '/work/src/file-000039.ts',
    },
    {
      condition: 'one path is past its share',
      count: 41,
      firstLeftOut: '/work/src/file-000040.ts',
      lastNamed: '/work/src/file-000039.ts',
    },
    {
      condition: 'many paths are past their share',
      count: 900,
      firstLeftOut: '/work/src/file-000040.ts',
      lastNamed: '/work/src/file-000039.ts',
    },
  ])(
    'should name the files of a set within 1,000 bytes and count the others when $condition',
    ({ count, firstLeftOut, lastNamed }) => {
      // Arrange
      const reminders = manyOf({
        count,
        rules: [
          commentRule,
        ],
      });

      // Act
      const lines = hotListLines(reminders);

      // Assert
      expect({
        lines: lines.length,
        namesTheFirstLeftOut: lines[0]?.includes(firstLeftOut),
        namesTheLastGiven: lines[0]?.includes(lastNamed),
      }).toStrictEqual({
        lines: 2,
        namesTheFirstLeftOut: false,
        namesTheLastGiven: true,
      });
    },
  );

  it.each([
    {
      condition: 'every set fits the budget',
      count: 2,
      lines: 6,
    },
    {
      condition: 'one set is past the budget',
      count: 3,
      lines: 7,
    },
    {
      condition: 'many sets are past the budget',
      count: 300,
      lines: 7,
    },
  ])(
    'should give the sets of hot rules within 4,500 bytes, and a note for the others, when $condition',
    ({ count, lines: expected }) => {
      // Arrange
      const reminders = setsOf(count);

      // Act
      const lines = hotListLines(reminders);

      // Assert
      expect({
        bytes: Buffer.byteLength(lines.join('\n')) <= 4500,
        lines: lines.length,
      }).toStrictEqual({
        bytes: true,
        lines: expected,
      });
    },
  );

  it('should count the files of a set past its share', () => {
    // Arrange
    const reminders = manyOf({
      count: 900,
      rules: [
        commentRule,
      ],
    });

    // Act
    const lines = hotListLines(reminders);

    // Assert
    expect(lines[0]?.includes('860')).toBe(true);
  });

  it('should note the one file whose set the budget leaves out', () => {
    // Arrange
    const reminders = setsOf(3);

    // Act
    const lines = hotListLines(reminders);

    // Assert
    expect(lines.at(-1)).toBe(leftOutFilesText.one);
  });

  it('should count the files whose sets the budget leaves out', () => {
    // Arrange
    const reminders = setsOf(300);

    // Act
    const lines = hotListLines(reminders);

    // Assert
    expect(lines.at(-1)?.includes('298')).toBe(true);
  });
});
