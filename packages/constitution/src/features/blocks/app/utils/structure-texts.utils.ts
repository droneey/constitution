import { GENERAL_SECTION, GOVERNS_LINE, REQUIREMENTS_SECTION } from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';

import type {
  AbstractBlocksDetails,
  BlockFormDetails,
  ConfigurationLanguagesDetails,
  CoreChaptersDetails,
  CorePartDetails,
  CyclesDetails,
  FrontMatterDetails,
  SeamsDetails,
} from '../../domain/use-cases/queries/check';
import {
  AbstractBlocksCode,
  BlockFormCode,
  ConfigurationLanguagesCode,
  CoreChaptersCode,
  CorePartCode,
  CyclesCode,
  FrontMatterCode,
  SeamsCode,
} from '../../domain/use-cases/queries/check';
import { aBlock, blocksOf } from './wording.utils';

const structureTexts: TextsOf<
  AbstractBlocksDetails &
    BlockFormDetails &
    ConfigurationLanguagesDetails &
    CoreChaptersDetails &
    CorePartDetails &
    CyclesDetails &
    FrontMatterDetails &
    SeamsDetails
> = {
  [AbstractBlocksCode.WithoutHeir]: () => 'is abstract and has no heir',
  [AbstractBlocksCode.NamesHeir]: ({ heir }) =>
    `names its heir ${heir}; a base knows nothing of its heirs`,
  [AbstractBlocksCode.SeamNamesHeir]: ({ heir }) =>
    `is a with/ file named after the heir ${heir}; a base knows nothing of its heirs`,
  [BlockFormCode.PassportHoldsRules]: () =>
    "holds rules; a block's passport holds its front matter, its title, what the block is, its setup and an implementation's Requirements, and its rules live in the chapters of its axes",
  [BlockFormCode.WithoutGoverns]: () =>
    `opens without its "# <Title>" and a "${GOVERNS_LINE}…" line; a chapter or a seam opens with both`,
  [BlockFormCode.WithoutRules]: () => 'holds no rule; a chapter or a seam holds at least one',
  [BlockFormCode.RuleOutsideSection]: ({ slug }) =>
    `has the rule "${slug}" under no section; every rule sits under a "## " section`,
  [BlockFormCode.SectionRepeatsTitle]: ({ section }) =>
    `has the section "${section}", named like the file's title; a section names a part of the file's subject`,
  [BlockFormCode.RequirementsNotLast]: () =>
    `has sections after "${REQUIREMENTS_SECTION}", which is the last section`,
  [BlockFormCode.GeneralNotFirst]: () =>
    `has sections before "${GENERAL_SECTION}", which is the first section`,
  [ConfigurationLanguagesCode.NotRequired]: ({ glob, language }) =>
    `governs ${glob}, a file of ${language}, without requiring ${language} directly or through the blocks it requires or extends`,
  [CoreChaptersCode.ChapterUnlisted]: ({ chapter }) =>
    `leaves ${chapter} out of its list of core's chapters; it lists every chapter of core once`,
  [CoreChaptersCode.ListsNoChapter]: ({ entry }) =>
    `lists ${entry}, which is not a chapter of core`,
  [CoreChaptersCode.ListedTwice]: ({ entry }) => `lists ${entry} twice`,
  [CorePartCode.OverBudget]: ({ budget, bytes }) =>
    `makes a core part of ${bytes} bytes; the digest holds at most ${budget} of core`,
  [CyclesCode.Cycle]: ({ cycle }) => `is part of a dependency cycle: ${cycle.join(' → ')}`,
  [FrontMatterCode.IdMismatch]: ({ declared, folder }) =>
    `declares the id "${declared}"; its folder names it "${folder}"`,
  [FrontMatterCode.FieldOutsideLayer]: ({ field, layer }) =>
    `sets "${field}", which ${aBlock(layer)} leaves empty`,
  [FrontMatterCode.NotLanguage]: ({ listed }) =>
    `languages lists ${listed}, which is not a language block`,
  [FrontMatterCode.AbstractWithoutUnderscore]: () => 'is abstract, so its id starts with "_"',
  [FrontMatterCode.UnderscoreNotAbstract]: () => 'has an id starting with "_", so it is abstract',
  [SeamsCode.NamedAfterOwnBlock]: () => 'is named after its own block',
  [SeamsCode.BlockPairsWithNone]: ({ block }) =>
    `is a with/ file of ${block}, which pairs with no block`,
  [SeamsCode.NotPair]: ({ other }) =>
    `is named after ${other}, which is not a block it may pair with`,
  [SeamsCode.OutOfLayer]: ({ allowed, layer, other, otherLayer }) =>
    `is named after ${other}, ${aBlock(otherLayer)}; ${aBlock(layer)} pairs only with ${blocksOf(allowed)}`,
  [SeamsCode.AlongDependency]: ({ block, other }) =>
    `is named after ${other}, which ${block} requires or extends, or which requires or extends it; such a rule is the dependent block's own`,
  [SeamsCode.TitleMismatch]: () =>
    "is titled otherwise than the other block's passport, whose title a seam takes",
  [SeamsCode.ChapterNamedAfterBlock]: ({ block }) =>
    `takes the id of the block ${block}; a file named after a block belongs in with/`,
};

export { structureTexts };
