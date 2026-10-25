import { describe, expect, it } from 'bun:test';

import { RequirementsTableCode, RuleFormCode } from '#/kernel/entities';
import { RuleSlug } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/core/foundation/principles.md';

describe('ruleFormTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: RuleFormCode.HeadingMisshapen,
        details: {
          heading: '### x - MUST',
        },
        path: PATH,
      },
      text: 'heading "### x - MUST" looks like a rule but is not "### <slug> · <LEVEL>", "### <slug> → <parent>" or "### <slug> → <parent> · <LEVEL>"',
    },
    {
      finding: {
        code: RuleFormCode.WithoutTable,
        details: {
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: 'rule "a" has no table "| Why | Tags |"',
    },
    {
      finding: {
        code: RuleFormCode.TablesMany,
        details: {
          count: 2,
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: 'rule "a" has 2 tables; a rule has one',
    },
    {
      finding: {
        code: RuleFormCode.HeaderMisshapen,
        details: {
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: 'rule "a" has a table whose header is not "| Why | Tags |"',
    },
    {
      finding: {
        code: RuleFormCode.RowsNotOne,
        details: {
          count: 0,
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: `rule "a" has 0 rows in its table; a rule's table has one`,
    },
    {
      finding: {
        code: RuleFormCode.CellsMiscounted,
        details: {
          count: 1,
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: `rule "a" has a row of 1 cells; a rule's table has 2`,
    },
    {
      finding: {
        code: RuleFormCode.TagsNotList,
        details: {
          slug: RuleSlug.create('a'),
          tags: 'ux, data',
        },
        path: PATH,
      },
      text: 'rule "a" has the Tags "ux, data"; Tags is a list, such as [security, ux] or []',
    },
    {
      finding: {
        code: RuleFormCode.HoldsLabel,
        details: {
          label: 'Why',
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: 'rule "a" has the label "Why"; a rule states Why and Tags in its table and holds no label but Example',
    },
    {
      finding: {
        code: RequirementsTableCode.HeaderMisshapen,
        details: {
          row: '| Requirement | How in lingui | Status |',
        },
        path: PATH,
      },
      text: 'has the header "| Requirement | How in lingui | Status |" in its Requirements; it is "| Requirement | How | Met |"',
    },
    {
      finding: {
        code: RequirementsTableCode.RowMisshapen,
        details: {
          row: '| Block | Requirement | Met |',
        },
        path: PATH,
      },
      text: 'has the row "| Block | Requirement | Met |" in its Requirements, which is not "| `<requirement>` | <how> | <met> |"',
    },
    {
      finding: {
        code: RequirementsTableCode.HeadingMisshapen,
        details: {
          heading: '# requirements',
        },
        path: PATH,
      },
      text: 'has the heading "# requirements", which names the Requirements section; it is "## Requirements"',
    },
  ])('should say $finding.code as the report words it', ({ finding, text }) => {
    // Arrange
    const reported = finding;

    // Act
    const said = findingTextOf(reported);

    // Assert
    expect(said).toBe(text);
  });
});
