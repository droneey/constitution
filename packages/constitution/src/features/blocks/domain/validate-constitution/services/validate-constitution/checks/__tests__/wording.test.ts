import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';

import { chapterFile, rule } from '../../../../../../__tests__/constitution.fixtures';
import { nestedFiles } from '../../../../../../__tests__/nested-files.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { WordingDetails } from '../wording';
import { WordingCode, wordingCheck } from '../wording';

const SCREENS = 'blocks/domains/presentation/@foundation/screens.md';

type WordingFinding = FindingOf<WordingDetails>;

const checkedRule = (input: {
  slug?: string;
  statement: string;
  why?: string;
}): readonly WordingFinding[] => {
  const files = nestedFiles();

  files[SCREENS] = chapterFile(
    'Screens',
    rule({
      slug: input.slug ?? 'screen-shows-one-task',
      statement: input.statement,
      ...(input.why === undefined
        ? {}
        : {
            why: input.why,
          }),
    }),
  );

  return wordingCheck(checkInputOf(files));
};

const slug = RuleSlug.create('screen-shows-one-task');

describe('wordingCheck', () => {
  it('should find nothing when every rule of a nested tree is worded as placement asks', () => {
    // Act
    const findings = wordingCheck(checkInputOf(nestedFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    expected: WordingFinding;
    name: string;
    statement: string;
    why?: string;
  }>([
    {
      expected: {
        code: WordingCode.SloganTooLong,
        details: {
          slug,
          words: 23,
        },
        path: SCREENS,
      },
      name: 'its slogan runs over 22 words',
      statement:
        'Every screen shows one task to its user at a time, so the user never has to hold two tasks in their mind.',
    },
    {
      expected: {
        code: WordingCode.SloganUnscoped,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'its slogan leaves its scope to an article',
      statement: 'A screen shows one task.',
    },
    {
      expected: {
        code: WordingCode.SloganUnscoped,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'its slogan names one subject only after its opening',
      statement: 'A screen shows The task.',
    },
    {
      expected: {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'an exception sits in the middle of three sentences',
      statement: 'Every screen shows one task. It names the task, except on a wizard. It closes.',
    },
    {
      expected: {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'an exception opened by ", save" sits before its last sentence',
      statement: 'Every screen, save the home one, shows one task. It names the task.',
    },
    {
      expected: {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'an exception sits before its last sentence',
      statement: 'Every screen shows one task, unless it is a wizard. It names the task.',
    },
    {
      expected: {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'its last sentence holds an exception without "Exempt:"',
      statement: 'Every screen shows one task. A wizard shows two unless short.',
    },
    {
      expected: {
        code: WordingCode.ModalVerb,
        details: {
          slug,
          verb: 'must',
        },
        path: SCREENS,
      },
      name: 'its statement says "must"',
      statement: 'Every screen must show one task.',
    },
    {
      expected: {
        code: WordingCode.WhyDashes,
        details: {
          dashes: 2,
          slug,
        },
        path: SCREENS,
      },
      name: 'its Why holds two dashes',
      statement: 'Every screen shows one task.',
      why: 'a user — any user — loses the task.',
    },
    {
      expected: {
        code: WordingCode.WhyUnclosed,
        details: {
          slug,
        },
        path: SCREENS,
      },
      name: 'its Why ends without a period',
      statement: 'Every screen shows one task.',
      why: 'a user loses the task',
    },
  ])('should report a rule when $name', ({ expected, statement, why }) => {
    // Act
    const findings = checkedRule({
      statement,
      ...(why === undefined
        ? {}
        : {
            why,
          }),
    });

    // Assert
    expect(findings).toStrictEqual([
      expected,
    ]);
  });

  it.each<{
    name: string;
    statement: string;
    why?: string;
  }>([
    {
      name: 'its exceptions sit in a last sentence opened by "Exempt:"',
      statement: 'Every screen shows one task. Exempt: a wizard, unless it is short.',
    },
    {
      name: 'its slogan names one subject by "The"',
      statement: 'The home screen shows one task.',
    },
    {
      name: 'its statement writes a modal verb as code',
      statement: 'Every screen sets `must` on its one task.',
    },
    {
      name: 'its exceptions follow two sentences in a last one opened by "Exempt:"',
      statement: 'Every screen shows one task. It names the task. Exempt: a wizard.',
    },
    {
      name: 'its slogan is short though the sentences after it are long',
      statement:
        'Every screen shows one task. It names that task in its title, so the user knows at a glance what the screen is for and why.',
    },
    {
      name: 'its slogan of 22 words holds two spaces in a row',
      statement:
        'Every screen shows one task to its user at a time, so the user never has to hold  two tasks in mind.',
    },
    {
      name: 'its words only hold the letters of an exception',
      statement: 'Every screen is exceptional, saved once and unlessened. It names the task.',
    },
    {
      name: 'its Why closes on one reference after one dash',
      statement: 'Every screen shows one task.',
      why: 'a user loses the task — the single-task principle.',
    },
    {
      name: 'its Why is empty, which the rule check reports',
      statement: 'Every screen shows one task.',
      why: '',
    },
    {
      name: 'its statement is empty, which the rule check reports',
      statement: '',
    },
    {
      name: 'its slogan holds exactly 22 words',
      statement:
        'Every screen shows one task to its user at a time, so the user never has to hold two tasks in mind.',
    },
  ])('should report nothing when $name', ({ statement, why }) => {
    // Act
    const findings = checkedRule({
      statement,
      ...(why === undefined
        ? {}
        : {
            why,
          }),
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should advise on a slug that joins two words with "and"', () => {
    // Act
    const findings = checkedRule({
      slug: 'screen-names-and-shows-one-task',
      statement: 'Every screen names and shows one task.',
    });

    // Assert
    expect(findings).toStrictEqual([
      {
        code: WordingCode.SlugJoinsWithAnd,
        details: {
          slug: RuleSlug.create('screen-names-and-shows-one-task'),
        },
        path: SCREENS,
      },
    ]);
  });

  it('should report nothing on a tree of the legacy format', () => {
    // Arrange
    const files = validFiles();

    files['blocks/core/foundation/principles.md'] = chapterFile(
      'Principles',
      rule({
        slug: 'a-rule',
        statement: 'A rule must hold.',
      }),
    );

    // Act
    const findings = wordingCheck(checkInputOf(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
