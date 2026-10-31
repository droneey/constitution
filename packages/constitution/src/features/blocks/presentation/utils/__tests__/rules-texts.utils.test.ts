import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { RulesDetails } from '../../../domain/validate-constitution/services';
import { RulesCode } from '../../../domain/validate-constitution/services';
import { rulesTexts } from '../rules-texts.utils';

describe('rulesTexts', () => {
  it.each<{
    problem: ProblemOf<RulesDetails>;
    text: string;
  }>([
    {
      problem: {
        code: RulesCode.SlugOpensWithNo,
        details: {
          slug: RuleSlug.create('no-any'),
        },
      },
      text: 'rule "no-any" opens with "no-"; a slug says what holds',
    },
    {
      problem: {
        code: RulesCode.WithoutStatement,
        details: {
          slug: RuleSlug.create('bare'),
        },
      },
      text: 'rule "bare" has no statement',
    },
    {
      problem: {
        code: RulesCode.WithoutWhy,
        details: {
          slug: RuleSlug.create('bare'),
        },
      },
      text: 'rule "bare" has no Why',
    },
    {
      problem: {
        code: RulesCode.DefinedTwice,
        details: {
          firstFile: 'blocks/core/foundation/principles.md',
          slug: RuleSlug.create('rules-bind'),
        },
      },
      text: 'rule "rules-bind" is also defined in blocks/core/foundation/principles.md',
    },
    {
      problem: {
        code: RulesCode.ParentNotRule,
        details: {
          parent: RuleSlug.create('plurals-by-icu'),
          slug: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'rule "plurals-by-cldr" carries out "plurals-by-icu", which is not a rule',
    },
    {
      problem: {
        code: RulesCode.ParentChainCycle,
        details: {
          cycle: [
            RuleSlug.create('a'),
            RuleSlug.create('b'),
            RuleSlug.create('a'),
          ],
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" carries out a chain that comes back to it: a → b → a',
    },
    {
      problem: {
        code: RulesCode.ParentInOwnBlock,
        details: {
          parent: RuleSlug.create('a'),
          slug: RuleSlug.create('b'),
        },
      },
      text: 'rule "b" carries out "a", a rule of its own block; a rule carries out only a rule of another block',
    },
    {
      problem: {
        code: RulesCode.ParentOutOfReach,
        details: {
          parent: RuleSlug.create('four-data-states'),
          parentBlock: BlockId.create('ui'),
          slug: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'rule "plurals-by-cldr" carries out "four-data-states" of ui, which its block may not refer to',
    },
    {
      problem: {
        code: RulesCode.ParentSeamOutOfReach,
        details: {
          parent: RuleSlug.create('writes-roll-back'),
          parentBlock: BlockId.create('ui'),
          parentSeam: BlockId.create('remote-data'),
          slug: RuleSlug.create('portals'),
        },
      },
      text: 'rule "portals" carries out "writes-roll-back" of ui with remote-data, which its place does not reach',
    },
    {
      problem: {
        code: RulesCode.ParentOffAxis,
        details: {
          axis: Axis.Foundation,
          parent: RuleSlug.create('rules-bind'),
          parentAxis: Axis.Workflow,
          slug: RuleSlug.create('plurals-by-cldr'),
        },
      },
      text: 'rule "plurals-by-cldr" carries out "rules-bind" on workflow, which a rule on foundation may not refer to',
    },
    {
      problem: {
        code: RulesCode.LooserThanParent,
        details: {
          level: Level.Should,
          parent: RuleSlug.create('four-data-states'),
          parentLevel: Level.Must,
          slug: RuleSlug.create('portals'),
        },
      },
      text: 'rule "portals" is SHOULD while it carries out the MUST rule "four-data-states"; a rule is never looser than the rule it carries out',
    },
    {
      problem: {
        code: RulesCode.WithoutLevel,
        details: {
          parent: RuleSlug.create('four-data-states'),
          slug: RuleSlug.create('portals'),
        },
      },
      text: 'rule "portals" carries out "four-data-states" without a level; a rule that carries out another states its own, never looser than it',
    },
    {
      problem: {
        code: RulesCode.OutsideParentChapter,
        details: {
          chapter: 'Types',
          parent: RuleSlug.create('dependencies-point-inward'),
          slug: RuleSlug.create('types-point-inward'),
        },
      },
      text: `rule "types-point-inward" sits in the chapter "Types" while it carries out "dependencies-point-inward" of core's chapter "untitled"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
    },
    {
      problem: {
        code: RulesCode.OutsideParentChapter,
        details: {
          parent: RuleSlug.create('dependencies-point-inward'),
          parentChapter: 'Principles',
          slug: RuleSlug.create('types-point-inward'),
        },
      },
      text: `rule "types-point-inward" sits in the chapter "untitled" while it carries out "dependencies-point-inward" of core's chapter "Principles"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(rulesTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
