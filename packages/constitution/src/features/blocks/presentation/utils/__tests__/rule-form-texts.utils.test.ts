import { describe, expect, it } from 'bun:test';

import type { RuleFormDetails } from '#/kernel/entities';
import { RuleFormCode } from '#/kernel/entities';
import type { ProblemOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { ruleFormTexts } from '../rule-form-texts.utils';

describe('ruleFormTexts', () => {
  it.each<{
    problem: ProblemOf<RuleFormDetails>;
    text: string;
  }>([
    {
      problem: {
        code: RuleFormCode.HeadingMisshapen,
        details: {
          heading: '### x - MUST',
        },
      },
      text: 'heading "### x - MUST" looks like a rule but is not "### <slug> · <LEVEL>", "### <slug> → <parent>" or "### <slug> → <parent> · <LEVEL>"',
    },
    {
      problem: {
        code: RuleFormCode.WithoutTable,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has no table "| Why |"',
    },
    {
      problem: {
        code: RuleFormCode.TablesMany,
        details: {
          count: 2,
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has 2 tables; a rule has one',
    },
    {
      problem: {
        code: RuleFormCode.HeaderMisshapen,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has a table whose header is not "| Why |"',
    },
    {
      problem: {
        code: RuleFormCode.RowsNotOne,
        details: {
          count: 0,
          slug: RuleSlug.create('a'),
        },
      },
      text: `rule "a" has 0 rows in its table; a rule's table has one`,
    },
    {
      problem: {
        code: RuleFormCode.CellsMiscounted,
        details: {
          count: 2,
          slug: RuleSlug.create('a'),
        },
      },
      text: `rule "a" has a row of 2 cells; a rule's table has 1`,
    },
    {
      problem: {
        code: RuleFormCode.WithoutWhySection,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has no section "#### Why" after its statement',
    },
    {
      problem: {
        code: RuleFormCode.WhyMisplaced,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has its section "#### Why" after another; it comes right after the statement',
    },
    {
      problem: {
        code: RuleFormCode.WithoutExamples,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has no section "#### Examples" after its Why',
    },
    {
      problem: {
        code: RuleFormCode.ExamplesNotLast,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has a section after "#### Examples"; Examples comes last',
    },
    {
      problem: {
        code: RuleFormCode.ExamplesHoldProse,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has text outside a code block in "#### Examples", which holds only fenced blocks',
    },
    {
      problem: {
        code: RuleFormCode.ExamplesHoldHeading,
        details: {
          heading: '##### Avoid',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has the heading "##### Avoid" inside "#### Examples", which holds only fenced blocks',
    },
    {
      problem: {
        code: RuleFormCode.ExampleUntitled,
        details: {
          language: 'ts',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has a ts block without a title in "#### Examples"; each block has title="…"',
    },
    {
      problem: {
        code: RuleFormCode.ExampleUntitled,
        details: {
          language: '',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has a code block without a title in "#### Examples"; each block has title="…"',
    },
    {
      problem: {
        code: RuleFormCode.SectionUnknown,
        details: {
          heading: '#### Notes',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has the section "#### Notes"; a rule holds only "#### Why" and "#### Examples"',
    },
    {
      problem: {
        code: RuleFormCode.FormsMixed,
        details: {
          sectioned: RuleSlug.create('b'),
          tabled: RuleSlug.create('a'),
        },
      },
      text: 'holds rules with a Why table, as "a", and rules with a section "#### Why", as "b"; a chapter holds one form',
    },
    {
      problem: {
        code: RuleFormCode.HoldsLabel,
        details: {
          label: 'Why',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has the label "Why"; a rule states its Why in its table and holds no label but Example',
    },
    {
      problem: {
        code: RuleFormCode.LevelRetired,
        details: {
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" is MAY in its heading; a heading states MUST or SHOULD, and only an override sets a rule to MAY',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(ruleFormTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
