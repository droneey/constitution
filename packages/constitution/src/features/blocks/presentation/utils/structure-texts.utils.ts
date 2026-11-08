import { VOCABULARY_SECTION } from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';

import { GENERAL_SECTION, GOVERNS_LINE } from '../../domain/validate-constitution/constants';
import type {
  BlockFormDetails,
  CoreChaptersDetails,
  CyclesDetails,
  FrontMatterDetails,
  SeamsDetails,
} from '../../domain/validate-constitution/services';
import {
  BlockFormCode,
  CoreChaptersCode,
  CyclesCode,
  FrontMatterCode,
  SeamsCode,
} from '../../domain/validate-constitution/services';
import { aBlock, blocksOf } from './wording.utils';

const structureTexts: TextsOf<
  BlockFormDetails & CoreChaptersDetails & CyclesDetails & FrontMatterDetails & SeamsDetails
> = {
  [BlockFormCode.PassportHoldsRules]: () =>
    "holds rules; a block's passport holds its front matter, its title, what the block is and its setup, and its rules live in the chapters of its axes",
  [BlockFormCode.WithoutGoverns]: () =>
    `opens without its "# <Title>" and a "${GOVERNS_LINE}…" line; a chapter or a seam opens with both`,
  [BlockFormCode.WithoutRules]: () => 'holds no rule; a chapter or a seam holds at least one',
  [BlockFormCode.RuleOutsideSection]: ({ slug }) =>
    `has the rule "${slug}" under no section; every rule sits under a "## " section`,
  [BlockFormCode.SectionRepeatsTitle]: ({ section }) =>
    `has the section "${section}", named like the file's title; a section names a part of the file's subject`,
  [BlockFormCode.GeneralNotFirst]: () =>
    `has sections before "${GENERAL_SECTION}", which is the first section`,
  [BlockFormCode.TextBeforeSections]: () =>
    'holds text between its Governs line and its first section; everything after the Governs line sits in a section',
  [BlockFormCode.VocabularyNotFirst]: () =>
    `has sections before "${VOCABULARY_SECTION}", which comes first`,
  [BlockFormCode.RuleInVocabulary]: ({ slug }) =>
    `has the rule "${slug}" in its "${VOCABULARY_SECTION}"; a vocabulary holds only definitions`,
  [BlockFormCode.SectionWithoutRules]: ({ section }) =>
    `has the section "${section}", which holds no rule; every section but the "${VOCABULARY_SECTION}" holds one`,
  [BlockFormCode.TermOutsideVocabulary]: ({ written }) =>
    `defines ${written} outside a "${VOCABULARY_SECTION}"; a term two rules share is defined in a vocabulary, and one rule's own term in its statement without bold or an id`,
  [BlockFormCode.PassportMisshapen]: () =>
    'holds more than its title, its one line under it and its setup; a passport introduces its block',
  [CoreChaptersCode.ChapterUnlisted]: ({ chapter }) =>
    `leaves ${chapter} out of its list of core's chapters; it lists every chapter of core once`,
  [CoreChaptersCode.ListsNoChapter]: ({ entry }) =>
    `lists ${entry}, which is not a chapter of core`,
  [CoreChaptersCode.ListedTwice]: ({ entry }) => `lists ${entry} twice`,
  [CyclesCode.Cycle]: ({ cycle }) => `is part of a dependency cycle: ${cycle.join(' → ')}`,
  [FrontMatterCode.IdMismatch]: ({ declared, folder }) =>
    `declares the id "${declared}"; its folder names it "${folder}"`,
  [FrontMatterCode.FieldOutsideLayer]: ({ field, layer }) =>
    `sets "${field}", which ${aBlock(layer)} leaves empty`,
  [FrontMatterCode.NotLanguage]: ({ listed }) =>
    `languages lists ${listed}, which is not a language block`,
  [SeamsCode.NamedAfterOwnBlock]: () => 'is named after its own block',
  [SeamsCode.BlockPairsWithNone]: ({ block }) =>
    `is a with/ file of ${block}, which pairs with no block`,
  [SeamsCode.NotPair]: ({ other }) =>
    `is named after ${other}, which is not a block it may pair with`,
  [SeamsCode.OutOfLayer]: ({ allowed, layer, other, otherLayer }) =>
    `is named after ${other}, ${aBlock(otherLayer)}; ${aBlock(layer)} pairs only with ${blocksOf(allowed)}`,
  [SeamsCode.AlongDependency]: ({ block, other }) =>
    `is named after ${other}, which ${block} requires or sits under, or which requires it or sits under it; such a rule is the dependent block's own`,
};

export { structureTexts };
