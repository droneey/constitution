import { describe, expect, it } from 'bun:test';

import type { RequirementsTableDetails, RuleFormDetails } from '#/kernel/entities';
import { RequirementsTableCode, RuleFormCode } from '#/kernel/entities';
import type { ProblemOf } from '#/kernel/types';
import { RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { ruleFormTexts } from '../rule-form-texts.utils';

describe('ruleFormTexts', () => {
  it.each<{
    problem: ProblemOf<RequirementsTableDetails & RuleFormDetails>;
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
      text: 'rule "a" has no table "| Why | Tags |"',
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
      text: 'rule "a" has a table whose header is not "| Why | Tags |"',
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
          count: 1,
          slug: RuleSlug.create('a'),
        },
      },
      text: `rule "a" has a row of 1 cells; a rule's table has 2`,
    },
    {
      problem: {
        code: RuleFormCode.TagsNotList,
        details: {
          slug: RuleSlug.create('a'),
          tags: 'ux, data',
        },
      },
      text: 'rule "a" has the Tags "ux, data"; Tags is a list, such as [security, ux] or []',
    },
    {
      problem: {
        code: RuleFormCode.HoldsLabel,
        details: {
          label: 'Why',
          slug: RuleSlug.create('a'),
        },
      },
      text: 'rule "a" has the label "Why"; a rule states Why and Tags in its table and holds no label but Example',
    },
    {
      problem: {
        code: RequirementsTableCode.HeaderMisshapen,
        details: {
          row: '| Requirement | How in lingui | Status |',
        },
      },
      text: 'has the header "| Requirement | How in lingui | Status |" in its Requirements; it is "| Requirement | How | Met |"',
    },
    {
      problem: {
        code: RequirementsTableCode.RowMisshapen,
        details: {
          row: '| Block | Requirement | Met |',
        },
      },
      text: 'has the row "| Block | Requirement | Met |" in its Requirements, which is not "| `<requirement>` | <how> | <met> |"',
    },
    {
      problem: {
        code: RequirementsTableCode.HeadingMisshapen,
        details: {
          heading: '# requirements',
        },
      },
      text: 'has the heading "# requirements", which names the Requirements section; it is "## Requirements"',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(ruleFormTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
