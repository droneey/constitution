import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import { BlockId, Glob, RuleSlug } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import {
  AbstractBlocksCode,
  BlockFormCode,
  ConfigurationLanguagesCode,
  CoreChaptersCode,
  CorePartCode,
  CyclesCode,
  FrontMatterCode,
  LayerField,
  SeamsCode,
} from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/domains/ui/ui.md';

describe('structureTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: AbstractBlocksCode.WithoutHeir,
        details: {},
        path: PATH,
      },
      text: 'is abstract and has no heir',
    },
    {
      finding: {
        code: AbstractBlocksCode.NamesHeir,
        details: {
          heir: BlockId.create('react-dom'),
        },
        path: PATH,
      },
      text: 'names its heir react-dom; a base knows nothing of its heirs',
    },
    {
      finding: {
        code: AbstractBlocksCode.SeamNamesHeir,
        details: {
          heir: BlockId.create('react-dom'),
        },
        path: PATH,
      },
      text: 'is a with/ file named after the heir react-dom; a base knows nothing of its heirs',
    },
    {
      finding: {
        code: BlockFormCode.PassportHoldsRules,
        details: {},
        path: PATH,
      },
      text: "holds rules; a block's passport holds its front matter, its title, what the block is, its setup and an implementation's Requirements, and its rules live in the chapters of its axes",
    },
    {
      finding: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
        path: PATH,
      },
      text: 'opens without its "# <Title>" and a "> Governs …" line; a chapter or a seam opens with both',
    },
    {
      finding: {
        code: BlockFormCode.WithoutRules,
        details: {},
        path: PATH,
      },
      text: 'holds no rule; a chapter or a seam holds at least one',
    },
    {
      finding: {
        code: BlockFormCode.RuleOutsideSection,
        details: {
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: PATH,
      },
      text: 'has the rule "i18n-plurals-by-cldr" under no section; every rule sits under a "## " section',
    },
    {
      finding: {
        code: BlockFormCode.SectionRepeatsTitle,
        details: {
          section: 'plurals',
        },
        path: PATH,
      },
      text: 'has the section "plurals", named like the file\'s title; a section names a part of the file\'s subject',
    },
    {
      finding: {
        code: BlockFormCode.RequirementsNotLast,
        details: {},
        path: PATH,
      },
      text: 'has sections after "Requirements for implementation", which is the last section',
    },
    {
      finding: {
        code: BlockFormCode.GeneralNotFirst,
        details: {},
        path: PATH,
      },
      text: 'has sections before "General", which is the first section',
    },
    {
      finding: {
        code: ConfigurationLanguagesCode.NotRequired,
        details: {
          glob: Glob.create('**/*.json'),
          language: BlockId.create('json'),
        },
        path: PATH,
      },
      text: 'governs **/*.json, a file of json, without requiring json directly or through the blocks it requires or extends',
    },
    {
      finding: {
        code: CoreChaptersCode.ChapterUnlisted,
        details: {
          chapter: 'blocks/core/workflow/workflow.md',
        },
        path: PATH,
      },
      text: "leaves blocks/core/workflow/workflow.md out of its list of core's chapters; it lists every chapter of core once",
    },
    {
      finding: {
        code: CoreChaptersCode.ListsNoChapter,
        details: {
          entry: 'blocks/core/foundation/gone.md',
        },
        path: PATH,
      },
      text: 'lists blocks/core/foundation/gone.md, which is not a chapter of core',
    },
    {
      finding: {
        code: CoreChaptersCode.ListedTwice,
        details: {
          entry: 'blocks/core/foundation/code.md',
        },
        path: PATH,
      },
      text: 'lists blocks/core/foundation/code.md twice',
    },
    {
      finding: {
        code: CorePartCode.OverBudget,
        details: {
          budget: 3500,
          bytes: 3509,
        },
        path: PATH,
      },
      text: 'makes a core part of 3509 bytes; the digest holds at most 3500 of core',
    },
    {
      finding: {
        code: CyclesCode.Cycle,
        details: {
          cycle: [
            BlockId.create('biome'),
            BlockId.create('lingui'),
            BlockId.create('biome'),
          ],
        },
        path: PATH,
      },
      text: 'is part of a dependency cycle: biome → lingui → biome',
    },
    {
      finding: {
        code: FrontMatterCode.IdMismatch,
        details: {
          declared: BlockId.create('ux'),
          folder: BlockId.create('ui'),
        },
        path: PATH,
      },
      text: 'declares the id "ux"; its folder names it "ui"',
    },
    {
      finding: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: LayerField.Abstract,
          layer: Layer.Core,
        },
        path: PATH,
      },
      text: 'sets "abstract", which a core block leaves empty',
    },
    {
      finding: {
        code: FrontMatterCode.NotLanguage,
        details: {
          listed: BlockId.create('kotlin'),
        },
        path: PATH,
      },
      text: 'languages lists kotlin, which is not a language block',
    },
    {
      finding: {
        code: FrontMatterCode.AbstractWithoutUnderscore,
        details: {},
        path: PATH,
      },
      text: 'is abstract, so its id starts with "_"',
    },
    {
      finding: {
        code: FrontMatterCode.UnderscoreNotAbstract,
        details: {},
        path: PATH,
      },
      text: 'has an id starting with "_", so it is abstract',
    },
    {
      finding: {
        code: SeamsCode.NamedAfterOwnBlock,
        details: {},
        path: PATH,
      },
      text: 'is named after its own block',
    },
    {
      finding: {
        code: SeamsCode.BlockPairsWithNone,
        details: {
          block: BlockId.create('core'),
        },
        path: PATH,
      },
      text: 'is a with/ file of core, which pairs with no block',
    },
    {
      finding: {
        code: SeamsCode.NotPair,
        details: {
          other: BlockId.create('nowhere'),
        },
        path: PATH,
      },
      text: 'is named after nowhere, which is not a block it may pair with',
    },
    {
      finding: {
        code: SeamsCode.OutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
            Layer.Platform,
            Layer.Language,
          ],
          layer: Layer.Platform,
          other: BlockId.create('biome'),
          otherLayer: Layer.Implementation,
        },
        path: PATH,
      },
      text: 'is named after biome, an implementation block; a platform block pairs only with domain blocks, platform blocks or language blocks',
    },
    {
      finding: {
        code: SeamsCode.OutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
          ],
          layer: Layer.Domain,
          other: BlockId.create('browser'),
          otherLayer: Layer.Platform,
        },
        path: PATH,
      },
      text: 'is named after browser, a platform block; a domain block pairs only with domain blocks',
    },
    {
      finding: {
        code: SeamsCode.AlongDependency,
        details: {
          block: BlockId.create('biome'),
          other: BlockId.create('typescript'),
        },
        path: PATH,
      },
      text: "is named after typescript, which biome requires or extends, or which requires or extends it; such a rule is the dependent block's own",
    },
    {
      finding: {
        code: SeamsCode.TitleMismatch,
        details: {},
        path: PATH,
      },
      text: "is titled otherwise than the other block's passport, whose title a seam takes",
    },
    {
      finding: {
        code: SeamsCode.ChapterNamedAfterBlock,
        details: {
          block: BlockId.create('ui'),
        },
        path: PATH,
      },
      text: 'takes the id of the block ui; a file named after a block belongs in with/',
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
