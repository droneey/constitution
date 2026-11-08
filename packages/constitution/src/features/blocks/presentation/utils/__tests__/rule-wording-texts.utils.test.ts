import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { WordingDetails } from '../../../domain/validate-constitution/services';
import { WordingCode } from '../../../domain/validate-constitution/services';
import { ruleWordingTexts } from '../rule-wording-texts.utils';

const slug = RuleSlug.create('screen-shows-one-task');

describe('ruleWordingTexts', () => {
  it.each<{
    problem: ProblemOf<WordingDetails>;
    text: string;
  }>([
    {
      problem: {
        code: WordingCode.SloganTooLong,
        details: {
          slug,
          words: 23,
        },
      },
      text: 'rule "screen-shows-one-task" opens with a slogan of 23 words; a slogan holds at most 22',
    },
    {
      problem: {
        code: WordingCode.SloganUnscoped,
        details: {
          slug,
        },
      },
      text: 'rule "screen-shows-one-task" opens with a slogan that leaves its scope to an article; a slogan scopes its subjects by every, each or all',
    },
    {
      problem: {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug,
        },
      },
      text: 'rule "screen-shows-one-task" states an exception outside its last sentence, or in one not opened by "Exempt:"; the exceptions sit in one last Exempt sentence',
    },
    {
      problem: {
        code: WordingCode.ModalVerb,
        details: {
          slug,
          verb: 'must',
        },
      },
      text: 'rule "screen-shows-one-task" says "must" in its statement; a rule is worded plainly, its level alone sets its force',
    },
    {
      problem: {
        code: WordingCode.WhyDashes,
        details: {
          dashes: 2,
          slug,
        },
      },
      text: 'rule "screen-shows-one-task" has 2 dashes in its Why; one dash opens the reference it closes on, and an aside takes commas or parentheses',
    },
    {
      problem: {
        code: WordingCode.WhyUnclosed,
        details: {
          slug,
        },
      },
      text: 'rule "screen-shows-one-task" has a Why that ends without a period',
    },
    {
      problem: {
        code: WordingCode.SlugJoinsWithAnd,
        details: {
          slug,
        },
      },
      text: 'rule "screen-shows-one-task" joins words with "and" in its slug; a rule holds one obligation, and two become two rules',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(ruleWordingTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
