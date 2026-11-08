import { Level } from '#/kernel/constants';

enum PlacementRule {
  Rank = 'rule-placed-in-the-rank-whose-loss-voids-it',
  CoreNamesNoEcosystem = 'core-names-no-ecosystem',
  DetailAsDefault = 'core-fixes-incidental-detail-only-as-a-default',
  Axis = 'rule-placed-on-the-axis-its-readers-share',
  BlockRoot = 'block-root-holds-its-passport-beside-its-axes',
  PassportHoldsNoRule = 'passport-holds-no-rule',
  PassportRequires = 'passport-requires-only-what-its-block-needs',
  Chapter = 'rule-placed-in-the-chapter-named-for-it',
  InSection = 'rule-sits-in-a-section-of-its-file',
  SectionOrder = 'sections-run-in-one-order',
  VocabularyDefinitions = 'vocabulary-holds-only-definitions',
  SectionHoldsRule = 'section-holds-a-rule',
  SeamUnrelated = 'seam-never-pairs-with-core-or-a-related-block',
  MoreSpecific = 'rule-beside-a-more-specific-block-is-its',
  Slogan = 'rule-opens-with-its-slogan',
  StatementOrder = 'statement-runs-from-its-scope-to-its-exceptions',
  SloganScope = 'slogan-scoped-by-every-each-or-all',
  NoEmphasis = 'rule-worded-without-emphasis',
  OneObligation = 'rule-holds-one-obligation',
  ReadAlone = 'rule-read-alone',
  TermInVocabulary = 'rule-term-defined-in-a-vocabulary',
  WhyReference = 'why-closes-on-an-established-reference',
  LevelByCost = 'level-set-by-the-cost-of-a-breach',
  Reach = 'rule-refers-only-within-its-reach',
  AxesStoodOn = 'rule-refers-only-to-the-axes-it-stands-on',
  RuleForm = 'core.md: How to use it',
}

type HeldLevel = Level.Must | Level.Should;

const PLACEMENT_LEVEL = {
  [PlacementRule.AxesStoodOn]: Level.Must,
  [PlacementRule.Axis]: Level.Must,
  [PlacementRule.BlockRoot]: Level.Must,
  [PlacementRule.Chapter]: Level.Must,
  [PlacementRule.CoreNamesNoEcosystem]: Level.Must,
  [PlacementRule.DetailAsDefault]: Level.Must,
  [PlacementRule.InSection]: Level.Must,
  [PlacementRule.LevelByCost]: Level.Must,
  [PlacementRule.MoreSpecific]: Level.Must,
  [PlacementRule.NoEmphasis]: Level.Should,
  [PlacementRule.OneObligation]: Level.Should,
  [PlacementRule.PassportHoldsNoRule]: Level.Must,
  [PlacementRule.PassportRequires]: Level.Must,
  [PlacementRule.Rank]: Level.Must,
  [PlacementRule.Reach]: Level.Must,
  [PlacementRule.ReadAlone]: Level.Should,
  [PlacementRule.RuleForm]: Level.Must,
  [PlacementRule.SeamUnrelated]: Level.Must,
  [PlacementRule.SectionHoldsRule]: Level.Must,
  [PlacementRule.SectionOrder]: Level.Must,
  [PlacementRule.Slogan]: Level.Should,
  [PlacementRule.SloganScope]: Level.Should,
  [PlacementRule.StatementOrder]: Level.Should,
  [PlacementRule.TermInVocabulary]: Level.Must,
  [PlacementRule.VocabularyDefinitions]: Level.Must,
  [PlacementRule.WhyReference]: Level.Should,
} as const satisfies Readonly<Record<PlacementRule, HeldLevel>>;

export type { HeldLevel };
export { PLACEMENT_LEVEL, PlacementRule };
