import { describe, expect, it } from 'bun:test';

import { Met } from '#/kernel/entities';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { RequirementsDetails } from '../../../application/use-cases/queries/check';
import { RequirementsCode } from '../../../application/use-cases/queries/check';
import { requirementsTexts } from '../requirements-texts.utils';

describe('requirementsTexts', () => {
  it.each<{
    problem: ProblemOf<RequirementsDetails>;
    text: string;
  }>([
    {
      problem: {
        code: RequirementsCode.OutsideImplementation,
        details: {},
      },
      text: 'answers requirements, which only an implementation does',
    },
    {
      problem: {
        code: RequirementsCode.OutsidePassport,
        details: {},
      },
      text: `answers requirements outside the block's passport; an implementation answers them in its passport <id>.md`,
    },
    {
      problem: {
        code: RequirementsCode.NotRule,
        details: {
          requirement: RuleSlug.create('no-such-rule'),
        },
      },
      text: 'answers "no-such-rule", which is not a rule',
    },
    {
      problem: {
        code: RequirementsCode.OwnRule,
        details: {
          requirement: RuleSlug.create('catalogs-compile'),
        },
      },
      text: 'answers "catalogs-compile", a rule of its own block; a Requirements table answers the blocks above',
    },
    {
      problem: {
        code: RequirementsCode.OutOfReach,
        details: {
          owner: BlockId.create('react-dom'),
          requirement: RuleSlug.create('portals'),
        },
      },
      text: 'answers "portals" of react-dom, which its block may not refer to',
    },
    {
      problem: {
        code: RequirementsCode.MetUnknown,
        details: {
          met: 'met',
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'answers "plurals-by-cldr" with Met "met"; Met is yes, partly or no',
    },
    {
      problem: {
        code: RequirementsCode.WithoutHow,
        details: {
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'answers "plurals-by-cldr" without saying how',
    },
    {
      problem: {
        code: RequirementsCode.WithoutCover,
        details: {
          met: Met.Partly,
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'answers "plurals-by-cldr" partly without naming the rule that covers the rest',
    },
    {
      problem: {
        code: RequirementsCode.Repeated,
        details: {
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'answers "plurals-by-cldr" twice',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(requirementsTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
