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
        code: RuleFormCode.HoldsLabel,
        details: {
          label: 'Why',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has the label "Why"; a rule holds no label, its Why going in "#### Why" and its examples in "#### Examples"',
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
