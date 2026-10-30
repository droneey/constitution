import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, Glob, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { FrontMatterField } from '../../../domain/entities';
import type {
  AbstractBlocksDetails,
  BlockFormDetails,
  ConfigurationLanguagesDetails,
  CoreChaptersDetails,
  CorePartDetails,
  CyclesDetails,
  FrontMatterDetails,
  SeamsDetails,
} from '../../../domain/services';
import {
  AbstractBlocksCode,
  BlockFormCode,
  ConfigurationLanguagesCode,
  CoreChaptersCode,
  CorePartCode,
  CyclesCode,
  FrontMatterCode,
  SeamsCode,
} from '../../../domain/services';
import { structureTexts } from '../structure-texts.utils';

describe('structureTexts', () => {
  it.each<{
    problem: ProblemOf<
      AbstractBlocksDetails &
        BlockFormDetails &
        ConfigurationLanguagesDetails &
        CoreChaptersDetails &
        CorePartDetails &
        CyclesDetails &
        FrontMatterDetails &
        SeamsDetails
    >;
    text: string;
  }>([
    {
      problem: {
        code: AbstractBlocksCode.WithoutHeir,
        details: {},
      },
      text: 'is abstract and has no heir',
    },
    {
      problem: {
        code: AbstractBlocksCode.NamesHeir,
        details: {
          heir: BlockId.create('react-dom'),
        },
      },
      text: 'names its heir react-dom; a base knows nothing of its heirs',
    },
    {
      problem: {
        code: AbstractBlocksCode.SeamNamesHeir,
        details: {
          heir: BlockId.create('react-dom'),
        },
      },
      text: 'is a with/ file named after the heir react-dom; a base knows nothing of its heirs',
    },
    {
      problem: {
        code: BlockFormCode.PassportHoldsRules,
        details: {},
      },
      text: "holds rules; a block's passport holds its front matter, its title, what the block is, its setup and an implementation's Requirements, and its rules live in the chapters of its axes",
    },
    {
      problem: {
        code: BlockFormCode.WithoutGoverns,
        details: {},
      },
      text: 'opens without its "# <Title>" and a "> Governs …" line; a chapter or a seam opens with both',
    },
    {
      problem: {
        code: BlockFormCode.WithoutRules,
        details: {},
      },
      text: 'holds no rule; a chapter or a seam holds at least one',
    },
    {
      problem: {
        code: BlockFormCode.RuleOutsideSection,
        details: {
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
      },
      text: 'has the rule "i18n-plurals-by-cldr" under no section; every rule sits under a "## " section',
    },
    {
      problem: {
        code: BlockFormCode.SectionRepeatsTitle,
        details: {
          section: 'plurals',
        },
      },
      text: 'has the section "plurals", named like the file\'s title; a section names a part of the file\'s subject',
    },
    {
      problem: {
        code: BlockFormCode.RequirementsNotLast,
        details: {},
      },
      text: 'has sections after "Requirements for implementation", which is the last section',
    },
    {
      problem: {
        code: BlockFormCode.GeneralNotFirst,
        details: {},
      },
      text: 'has sections before "General", which is the first section',
    },
    {
      problem: {
        code: ConfigurationLanguagesCode.NotRequired,
        details: {
          glob: Glob.create('**/*.json'),
          language: BlockId.create('json'),
        },
      },
      text: 'governs **/*.json, a file of json, without requiring json directly or through the blocks it requires or extends',
    },
    {
      problem: {
        code: CoreChaptersCode.ChapterUnlisted,
        details: {
          chapter: 'blocks/core/workflow/workflow.md',
        },
      },
      text: "leaves blocks/core/workflow/workflow.md out of its list of core's chapters; it lists every chapter of core once",
    },
    {
      problem: {
        code: CoreChaptersCode.ListsNoChapter,
        details: {
          entry: 'blocks/core/foundation/gone.md',
        },
      },
      text: 'lists blocks/core/foundation/gone.md, which is not a chapter of core',
    },
    {
      problem: {
        code: CoreChaptersCode.ListedTwice,
        details: {
          entry: 'blocks/core/foundation/code.md',
        },
      },
      text: 'lists blocks/core/foundation/code.md twice',
    },
    {
      problem: {
        code: CorePartCode.OverBudget,
        details: {
          budget: 3500,
          bytes: 3509,
        },
      },
      text: 'makes a core part of 3509 bytes; the digest holds at most 3500 of core',
    },
    {
      problem: {
        code: CyclesCode.Cycle,
        details: {
          cycle: [
            BlockId.create('biome'),
            BlockId.create('lingui'),
            BlockId.create('biome'),
          ],
        },
      },
      text: 'is part of a dependency cycle: biome → lingui → biome',
    },
    {
      problem: {
        code: FrontMatterCode.IdMismatch,
        details: {
          declared: BlockId.create('ux'),
          folder: BlockId.create('ui'),
        },
      },
      text: 'declares the id "ux"; its folder names it "ui"',
    },
    {
      problem: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Abstract,
          layer: Layer.Core,
        },
      },
      text: 'sets "abstract", which a core block leaves empty',
    },
    {
      problem: {
        code: FrontMatterCode.NotLanguage,
        details: {
          listed: BlockId.create('kotlin'),
        },
      },
      text: 'languages lists kotlin, which is not a language block',
    },
    {
      problem: {
        code: FrontMatterCode.AbstractWithoutUnderscore,
        details: {},
      },
      text: 'is abstract, so its id starts with "_"',
    },
    {
      problem: {
        code: FrontMatterCode.UnderscoreNotAbstract,
        details: {},
      },
      text: 'has an id starting with "_", so it is abstract',
    },
    {
      problem: {
        code: SeamsCode.NamedAfterOwnBlock,
        details: {},
      },
      text: 'is named after its own block',
    },
    {
      problem: {
        code: SeamsCode.BlockPairsWithNone,
        details: {
          block: BlockId.create('core'),
        },
      },
      text: 'is a with/ file of core, which pairs with no block',
    },
    {
      problem: {
        code: SeamsCode.NotPair,
        details: {
          other: BlockId.create('nowhere'),
        },
      },
      text: 'is named after nowhere, which is not a block it may pair with',
    },
    {
      problem: {
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
      },
      text: 'is named after biome, an implementation block; a platform block pairs only with domain blocks, platform blocks or language blocks',
    },
    {
      problem: {
        code: SeamsCode.OutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
          ],
          layer: Layer.Domain,
          other: BlockId.create('browser'),
          otherLayer: Layer.Platform,
        },
      },
      text: 'is named after browser, a platform block; a domain block pairs only with domain blocks',
    },
    {
      problem: {
        code: SeamsCode.AlongDependency,
        details: {
          block: BlockId.create('biome'),
          other: BlockId.create('typescript'),
        },
      },
      text: "is named after typescript, which biome requires or extends, or which requires or extends it; such a rule is the dependent block's own",
    },
    {
      problem: {
        code: SeamsCode.TitleMismatch,
        details: {},
      },
      text: "is titled otherwise than the other block's passport, whose title a seam takes",
    },
    {
      problem: {
        code: SeamsCode.ChapterNamedAfterBlock,
        details: {
          block: BlockId.create('ui'),
        },
      },
      text: 'takes the id of the block ui; a file named after a block belongs in with/',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(structureTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
