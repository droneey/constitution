import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';
import { Met } from '#/kernel/entities';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import {
  BudgetCode,
  DecisionsCode,
  LinksCode,
  ReferencesCode,
  RequirementsCode,
  RulesCode,
  TermKind,
  TermsCode,
} from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/domains/ui/foundation/forms.md';
const LOG = 'DECISIONS.md';

describe('rulesTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: RulesCode.SlugOpensWithNo,
        details: {
          slug: RuleSlug.create('no-any'),
        },
        path: PATH,
      },
      text: 'rule "no-any" opens with "no-"; a slug says what holds',
    },
    {
      finding: {
        code: RulesCode.WithoutStatement,
        details: {
          slug: RuleSlug.create('bare'),
        },
        path: PATH,
      },
      text: 'rule "bare" has no statement',
    },
    {
      finding: {
        code: RulesCode.WithoutWhy,
        details: {
          slug: RuleSlug.create('bare'),
        },
        path: PATH,
      },
      text: 'rule "bare" has no Why',
    },
    {
      finding: {
        code: RulesCode.TagNotLens,
        details: {
          slug: RuleSlug.create('bare'),
          tag: 'vibes',
        },
        path: PATH,
      },
      text: 'rule "bare" has the tag "vibes", which is not a lens',
    },
    {
      finding: {
        code: RulesCode.DefinedTwice,
        details: {
          firstFile: 'blocks/core/foundation/principles.md',
          slug: RuleSlug.create('rules-bind'),
        },
        path: PATH,
      },
      text: 'rule "rules-bind" is also defined in blocks/core/foundation/principles.md',
    },
    {
      finding: {
        code: RulesCode.ParentNotRule,
        details: {
          parent: RuleSlug.create('plurals-by-icu'),
          slug: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'rule "plurals-by-cldr" carries out "plurals-by-icu", which is not a rule',
    },
    {
      finding: {
        code: RulesCode.ParentChainCycle,
        details: {
          cycle: [
            RuleSlug.create('a'),
            RuleSlug.create('b'),
            RuleSlug.create('a'),
          ],
          slug: RuleSlug.create('a'),
        },
        path: PATH,
      },
      text: 'rule "a" carries out a chain that comes back to it: a → b → a',
    },
    {
      finding: {
        code: RulesCode.ParentInOwnBlock,
        details: {
          parent: RuleSlug.create('a'),
          slug: RuleSlug.create('b'),
        },
        path: PATH,
      },
      text: 'rule "b" carries out "a", a rule of its own block; a rule carries out only a rule of another block',
    },
    {
      finding: {
        code: RulesCode.ParentOutOfReach,
        details: {
          parent: RuleSlug.create('four-data-states'),
          parentBlock: BlockId.create('ui'),
          slug: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'rule "plurals-by-cldr" carries out "four-data-states" of ui, which its block may not refer to',
    },
    {
      finding: {
        code: RulesCode.ParentSeamOutOfReach,
        details: {
          parent: RuleSlug.create('writes-roll-back'),
          parentBlock: BlockId.create('ui'),
          parentSeam: BlockId.create('remote-data'),
          slug: RuleSlug.create('portals'),
        },
        path: PATH,
      },
      text: 'rule "portals" carries out "writes-roll-back" of ui with remote-data, which its place does not reach',
    },
    {
      finding: {
        code: RulesCode.ParentOffAxis,
        details: {
          axis: Axis.Foundation,
          parent: RuleSlug.create('rules-bind'),
          parentAxis: Axis.Workflow,
          slug: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'rule "plurals-by-cldr" carries out "rules-bind" on workflow, which a rule on foundation may not refer to',
    },
    {
      finding: {
        code: RulesCode.LooserThanParent,
        details: {
          level: Level.Should,
          parent: RuleSlug.create('four-data-states'),
          parentLevel: Level.Must,
          slug: RuleSlug.create('portals'),
        },
        path: PATH,
      },
      text: 'rule "portals" is SHOULD while it carries out the MUST rule "four-data-states"; a rule is never looser than the rule it carries out',
    },
    {
      finding: {
        code: RulesCode.WithoutLevel,
        details: {
          parent: RuleSlug.create('four-data-states'),
          slug: RuleSlug.create('portals'),
        },
        path: PATH,
      },
      text: 'rule "portals" carries out "four-data-states" without a level; a rule that carries out another states its own, never looser than it',
    },
    {
      finding: {
        code: RulesCode.OutsideParentChapter,
        details: {
          chapter: 'Types',
          parent: RuleSlug.create('dependencies-point-inward'),
          parentChapter: undefined,
          slug: RuleSlug.create('types-point-inward'),
        },
        path: PATH,
      },
      text: `rule "types-point-inward" sits in the chapter "Types" while it carries out "dependencies-point-inward" of core's chapter "untitled"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
    },
    {
      finding: {
        code: RulesCode.OutsideParentChapter,
        details: {
          chapter: undefined,
          parent: RuleSlug.create('dependencies-point-inward'),
          parentChapter: 'Principles',
          slug: RuleSlug.create('types-point-inward'),
        },
        path: PATH,
      },
      text: `rule "types-point-inward" sits in the chapter "untitled" while it carries out "dependencies-point-inward" of core's chapter "Principles"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
    },
    {
      finding: {
        code: TermsCode.Misshapen,
        details: {
          written: 'the `x` folder',
        },
        path: PATH,
      },
      text: 'sets "the `x` folder" in bold, which is neither plain words nor one code span; bold defines a term',
    },
    {
      finding: {
        code: TermsCode.DefinedTwice,
        details: {
          firstBlock: BlockId.create('biome'),
          firstFile: 'blocks/implementations/biome/biome.md',
          term: 'Biome',
        },
        path: PATH,
      },
      text: 'defines "Biome", which blocks/implementations/biome/biome.md of biome defines already; a term is defined once',
    },
    {
      finding: {
        code: TermsCode.OffAxis,
        details: {
          axis: Axis.Foundation,
          term: 'port',
          termAxis: Axis.Architecture,
        },
        path: PATH,
      },
      text: 'uses "port", a term of the architecture; foundation holds whatever the architecture',
    },
    {
      finding: {
        code: TermsCode.OutOfReach,
        details: {
          owner: BlockId.create('typescript'),
          term: 'TypeScript',
        },
        path: PATH,
      },
      text: 'uses "TypeScript", which typescript defines; only typescript and the blocks that build on it may',
    },
    {
      finding: {
        code: TermsCode.Misspelled,
        details: {
          kind: TermKind.Folder,
          owner: BlockId.create('core'),
          term: 'adapters/',
          written: 'adapters',
        },
        path: PATH,
      },
      text: 'writes `adapters`, which core defines as `adapters/`; a folder keeps one spelling',
    },
    {
      finding: {
        code: RequirementsCode.OutsideImplementation,
        details: {},
        path: PATH,
      },
      text: 'answers requirements, which only an implementation does',
    },
    {
      finding: {
        code: RequirementsCode.OutsidePassport,
        details: {},
        path: PATH,
      },
      text: `answers requirements outside the block's passport; an implementation answers them in its passport <id>.md`,
    },
    {
      finding: {
        code: RequirementsCode.NotRule,
        details: {
          requirement: RuleSlug.create('no-such-rule'),
        },
        path: PATH,
      },
      text: 'answers "no-such-rule", which is not a rule',
    },
    {
      finding: {
        code: RequirementsCode.OwnRule,
        details: {
          requirement: RuleSlug.create('catalogs-compile'),
        },
        path: PATH,
      },
      text: 'answers "catalogs-compile", a rule of its own block; a Requirements table answers the blocks above',
    },
    {
      finding: {
        code: RequirementsCode.OutOfReach,
        details: {
          owner: BlockId.create('react-dom'),
          requirement: RuleSlug.create('portals'),
        },
        path: PATH,
      },
      text: 'answers "portals" of react-dom, which its block may not refer to',
    },
    {
      finding: {
        code: RequirementsCode.MetUnknown,
        details: {
          met: 'met',
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'answers "plurals-by-cldr" with Met "met"; Met is yes, partly or no',
    },
    {
      finding: {
        code: RequirementsCode.WithoutHow,
        details: {
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'answers "plurals-by-cldr" without saying how',
    },
    {
      finding: {
        code: RequirementsCode.WithoutCover,
        details: {
          met: Met.Partly,
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'answers "plurals-by-cldr" partly without naming the rule that covers the rest',
    },
    {
      finding: {
        code: RequirementsCode.Repeated,
        details: {
          requirement: RuleSlug.create('plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'answers "plurals-by-cldr" twice',
    },
    {
      finding: {
        code: DecisionsCode.LogMissing,
        details: {},
        path: LOG,
      },
      text: 'is missing; the Constitution keeps its decision log at the root',
    },
    {
      finding: {
        code: DecisionsCode.OutOfOrder,
        details: {
          entry: 7,
          previous: 12,
        },
        path: LOG,
      },
      text: 'entry ADR-0007 follows ADR-0012; the numbers of the log only rise',
    },
    {
      finding: {
        code: DecisionsCode.WithoutDateLine,
        details: {
          entry: 1,
        },
        path: LOG,
      },
      text: 'entry ADR-0001 has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed" under its heading',
    },
    {
      finding: {
        code: DecisionsCode.NotCalendarDate,
        details: {
          date: '2026-02-30',
          entry: 123,
        },
        path: LOG,
      },
      text: 'entry ADR-0123 is dated 2026-02-30, which is not a calendar date',
    },
    {
      finding: {
        code: ReferencesCode.LinkIntoOtherBlock,
        details: {
          owner: BlockId.create('i18n'),
          target: '../../i18n/',
        },
        path: PATH,
      },
      text: 'links to ../../i18n/, a file of the block i18n; a block refers to another only through its front matter and with/ file names',
    },
    {
      finding: {
        code: ReferencesCode.NamesOtherRule,
        details: {
          owner: BlockId.create('react-dom'),
          slug: RuleSlug.create('portals'),
        },
        path: PATH,
      },
      text: 'names the rule portals of react-dom; a rule refers to another only as the parent in its heading',
    },
    {
      finding: {
        code: ReferencesCode.CitesDecision,
        details: {
          decision: 'ADR-0012',
        },
        path: PATH,
      },
      text: 'cites ADR-0012; a block states its rules without citing the decision log',
    },
    {
      finding: {
        code: LinksCode.MissingTarget,
        details: {
          target: 'local/plan.md',
        },
        path: PATH,
      },
      text: 'links to a missing file "local/plan.md"',
    },
    {
      finding: {
        code: BudgetCode.FileOverBudget,
        details: {
          budget: 500,
          lines: 501,
        },
        path: PATH,
      },
      text: 'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
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
