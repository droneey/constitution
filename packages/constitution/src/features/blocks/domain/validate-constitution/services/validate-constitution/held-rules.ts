import { Level } from '#/kernel/constants';
import { RuleFormCode } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';

import { BlockLoadCode, PlaceCode } from '../../../block/entities';
import { LoadCode } from '../../../constitution/entities';
import type { HeldLevel } from '../../constants';
import { PLACEMENT_LEVEL, PlacementRule } from '../../constants';
import type { BlockFinding, BlockFindingCode } from './block-finding.types';
import {
  BlockFormCode,
  BudgetCode,
  CyclesCode,
  FrontMatterCode,
  NamesCode,
  ReferencesCode,
  RequiresCode,
  RulesCode,
  SeamsCode,
  TermsCode,
  WordingCode,
} from './checks';

const HELD_RULES = {
  [BlockFormCode.GeneralNotFirst]: PlacementRule.SectionOrder,
  [BlockFormCode.PassportHoldsRules]: PlacementRule.PassportHoldsNoRule,
  [BlockFormCode.PassportMisshapen]: PlacementRule.PassportHoldsNoRule,
  [BlockFormCode.RuleInVocabulary]: PlacementRule.VocabularyDefinitions,
  [BlockFormCode.RuleOutsideSection]: PlacementRule.InSection,
  [BlockFormCode.SectionRepeatsTitle]: PlacementRule.SectionOrder,
  [BlockFormCode.SectionWithoutRules]: PlacementRule.SectionHoldsRule,
  [BlockFormCode.TermOutsideVocabulary]: PlacementRule.TermInVocabulary,
  [BlockFormCode.TextBeforeSections]: PlacementRule.InSection,
  [BlockFormCode.VocabularyNotFirst]: PlacementRule.SectionOrder,
  [BlockFormCode.WithoutGoverns]: PlacementRule.InSection,
  [BlockFormCode.WithoutRules]: PlacementRule.SectionHoldsRule,
  [BudgetCode.FileOverBudget]: PlacementRule.FileBudget,
  [BlockLoadCode.SecondaryFrontMatter]: PlacementRule.BlockRoot,
  [BlockLoadCode.WithoutPassport]: PlacementRule.BlockRoot,
  [CyclesCode.Cycle]: PlacementRule.PassportRequires,
  [FrontMatterCode.IdMismatch]: PlacementRule.BlockRoot,
  [LoadCode.IdShared]: PlacementRule.BlockRoot,
  [NamesCode.CoreNamesProduct]: PlacementRule.CoreNamesNoEcosystem,
  [NamesCode.ParentNamesChild]: PlacementRule.Rank,
  [NamesCode.ProductOfNoBlock]: PlacementRule.Rank,
  [NamesCode.ProductOutOfReach]: PlacementRule.Rank,
  [PlaceCode.ChapterNamedAfterBlock]: PlacementRule.Chapter,
  [PlaceCode.OutsideBlockFolder]: PlacementRule.BlockRoot,
  [PlaceCode.StrayBlockFile]: PlacementRule.BlockRoot,
  [ReferencesCode.CitesDecision]: PlacementRule.ReadAlone,
  [ReferencesCode.LinkIntoOtherBlock]: PlacementRule.Reach,
  [ReferencesCode.NamesOtherRule]: PlacementRule.Reach,
  [RequiresCode.RequiresAncestor]: PlacementRule.PassportRequires,
  [RequiresCode.RequiresCore]: PlacementRule.PassportRequires,
  [RequiresCode.RequiresItself]: PlacementRule.PassportRequires,
  [RequiresCode.RequiresNoBlock]: PlacementRule.PassportRequires,
  [RequiresCode.RequiresOutOfLayer]: PlacementRule.PassportRequires,
  [RequiresCode.RequiresThroughParent]: PlacementRule.PassportRequires,
  [RuleFormCode.ExampleUntitled]: PlacementRule.RuleForm,
  [RuleFormCode.ExamplesHoldHeading]: PlacementRule.RuleForm,
  [RuleFormCode.ExamplesHoldProse]: PlacementRule.RuleForm,
  [RuleFormCode.ExamplesNotLast]: PlacementRule.RuleForm,
  [RuleFormCode.HeadingMisshapen]: PlacementRule.RuleForm,
  [RuleFormCode.HoldsLabel]: PlacementRule.RuleForm,
  [RuleFormCode.LevelRetired]: PlacementRule.LevelByCost,
  [RuleFormCode.SectionUnknown]: PlacementRule.RuleForm,
  [RuleFormCode.WhyMisplaced]: PlacementRule.RuleForm,
  [RuleFormCode.WithoutExamples]: PlacementRule.RuleForm,
  [RuleFormCode.WithoutWhySection]: PlacementRule.RuleForm,
  [RulesCode.DefinedTwice]: PlacementRule.RuleForm,
  [RulesCode.LooserThanParent]: PlacementRule.RuleForm,
  [RulesCode.ParentChainCycle]: PlacementRule.Reach,
  [RulesCode.ParentInOwnBlock]: PlacementRule.Reach,
  [RulesCode.ParentNotRule]: PlacementRule.Reach,
  [RulesCode.ParentOffAxis]: PlacementRule.AxesStoodOn,
  [RulesCode.ParentOutOfReach]: PlacementRule.Reach,
  [RulesCode.ParentSeamOutOfReach]: PlacementRule.Reach,
  [RulesCode.WithoutLevel]: PlacementRule.RuleForm,
  [RulesCode.WithoutStatement]: PlacementRule.RuleForm,
  [RulesCode.WithoutWhy]: PlacementRule.RuleForm,
  [SeamsCode.AlongDependency]: PlacementRule.SeamUnrelated,
  [SeamsCode.BlockPairsWithNone]: PlacementRule.SeamUnrelated,
  [SeamsCode.NamedAfterOwnBlock]: PlacementRule.SeamUnrelated,
  [SeamsCode.NotPair]: PlacementRule.SeamUnrelated,
  [SeamsCode.OutOfLayer]: PlacementRule.MoreSpecific,
  [TermsCode.DefinedTwice]: PlacementRule.TermInVocabulary,
  [TermsCode.IdMisshapen]: PlacementRule.DetailAsDefault,
  [TermsCode.IdRepeated]: PlacementRule.DetailAsDefault,
  [TermsCode.Misshapen]: PlacementRule.TermInVocabulary,
  [TermsCode.OffAxis]: PlacementRule.Axis,
  [TermsCode.OutOfReach]: PlacementRule.Reach,
  [TermsCode.Unused]: PlacementRule.TermInVocabulary,
  [TermsCode.WithoutId]: PlacementRule.DetailAsDefault,
  [ValueFailure.BlockId]: PlacementRule.BlockRoot,
  [WordingCode.ExceptionMisplaced]: PlacementRule.StatementOrder,
  [WordingCode.ModalVerb]: PlacementRule.NoEmphasis,
  [WordingCode.SloganTooLong]: PlacementRule.Slogan,
  [WordingCode.SloganUnscoped]: PlacementRule.SloganScope,
  [WordingCode.SlugJoinsWithAnd]: PlacementRule.OneObligation,
  [WordingCode.WhyDashes]: PlacementRule.WhyReference,
  [WordingCode.WhyUnclosed]: PlacementRule.WhyReference,
} as const satisfies Readonly<Partial<Record<BlockFindingCode, PlacementRule>>>;

// Why: a word test cannot tell two obligations from a list of subjects under one verb, nor a
// term no rule uses from one a rule uses in another form, so these findings advise and never fail.
const advisoryCodes: ReadonlySet<BlockFindingCode> = new Set([
  TermsCode.Unused,
  WordingCode.SlugJoinsWithAnd,
]);

interface Held {
  readonly level: HeldLevel;
  readonly rule: PlacementRule;
}

const heldRules: Readonly<Partial<Record<BlockFindingCode, PlacementRule>>> = HELD_RULES;

const heldRuleOf = (code: BlockFindingCode): Held | undefined => {
  const rule = heldRules[code];

  return rule === undefined
    ? undefined
    : {
        level: PLACEMENT_LEVEL[rule],
        rule,
      };
};

interface Severity {
  readonly isPack: boolean;
  readonly lowered: ReadonlyMap<string, Level>;
}

const isAdvice = (finding: BlockFinding, severity: Severity): boolean => {
  if (advisoryCodes.has(finding.code)) {
    return true;
  }

  const held = heldRuleOf(finding.code);

  if (!severity.isPack || held === undefined) {
    return false;
  }

  return (severity.lowered.get(held.rule) ?? held.level) !== Level.Must;
};

export type { Held, Severity };
export { heldRuleOf, isAdvice };
