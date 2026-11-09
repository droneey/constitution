import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { FrontMatterField } from '../../../domain/block/entities';
import type {
  BlockFormDetails,
  CoreChaptersDetails,
  CyclesDetails,
  FrontMatterDetails,
  SeamsDetails,
} from '../../../domain/validate-constitution/services';
import {
  BlockFormCode,
  CoreChaptersCode,
  CyclesCode,
  FrontMatterCode,
  SeamsCode,
} from '../../../domain/validate-constitution/services';
import { structureTexts } from '../structure-texts.utils';

describe('structureTexts', () => {
  it.each<{
    problem: ProblemOf<
      BlockFormDetails & CoreChaptersDetails & CyclesDetails & FrontMatterDetails & SeamsDetails
    >;
    text: string;
  }>([
    {
      problem: {
        code: BlockFormCode.PassportHoldsRules,
        details: {},
      },
      text: "holds rules; a block's passport holds its front matter, its title, what the block is and its setup, and its rules live in the chapters of its axes",
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
        code: BlockFormCode.GeneralNotFirst,
        details: {},
      },
      text: 'has sections before "General", which is the first section',
    },
    {
      problem: {
        code: CoreChaptersCode.ChapterUnlisted,
        details: {
          chapter: 'blocks/core/@workflow/workflow.md',
        },
      },
      text: "leaves blocks/core/@workflow/workflow.md out of its list of core's chapters; it lists every chapter of core once",
    },
    {
      problem: {
        code: CoreChaptersCode.ListsNoChapter,
        details: {
          entry: 'blocks/core/@foundation/gone.md',
        },
      },
      text: 'lists blocks/core/@foundation/gone.md, which is not a chapter of core',
    },
    {
      problem: {
        code: CoreChaptersCode.ListedTwice,
        details: {
          entry: 'blocks/core/@foundation/code.md',
        },
      },
      text: 'lists blocks/core/@foundation/code.md twice',
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
          field: FrontMatterField.Requires,
          layer: Layer.Core,
        },
      },
      text: 'sets "requires", which a core block leaves empty',
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
      text: "is named after typescript, which biome requires or sits under, or which requires it or sits under it; such a rule is the dependent block's own",
    },
    {
      problem: {
        code: BlockFormCode.TextBeforeSections,
        details: {},
      },
      text: 'holds text between its Governs line and its first section; everything after the Governs line sits in a section',
    },
    {
      problem: {
        code: BlockFormCode.VocabularyNotFirst,
        details: {},
      },
      text: 'has sections before "Vocabulary", which comes first',
    },
    {
      problem: {
        code: BlockFormCode.RuleInVocabulary,
        details: {
          slug: RuleSlug.create('screen-shows-one-task'),
        },
      },
      text: 'has the rule "screen-shows-one-task" in its "Vocabulary"; a vocabulary holds only definitions',
    },
    {
      problem: {
        code: BlockFormCode.SectionWithoutRules,
        details: {
          section: 'Layout',
        },
      },
      text: 'has the section "Layout", which holds no rule; every section but the "Vocabulary" holds one',
    },
    {
      problem: {
        code: BlockFormCode.TermOutsideVocabulary,
        details: {
          written: '**task**',
        },
      },
      text: `defines **task** outside a "Vocabulary"; a term two rules share is defined in a vocabulary, and one rule's own term in its statement without bold or an id`,
    },
    {
      problem: {
        code: BlockFormCode.PassportMisshapen,
        details: {},
      },
      text: 'holds more than its title, its one line under it and its setup; a passport introduces its block',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(structureTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
