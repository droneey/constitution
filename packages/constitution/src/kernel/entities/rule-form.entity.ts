import type { ProblemOf } from '../types';
import type { RuleSlug } from '../value-objects';

enum RuleFormCode {
  HeadingMisshapen = 'rule-heading-misshapen',
  WithoutTable = 'rule-without-table',
  TablesMany = 'rule-with-many-tables',
  HeaderMisshapen = 'rule-table-header-misshapen',
  RowsNotOne = 'rule-table-rows-not-one',
  CellsMiscounted = 'rule-table-cells-miscounted',
  HoldsLabel = 'rule-holds-label',
  LevelRetired = 'rule-level-retired',
  WithoutWhySection = 'rule-without-why-section',
  WhyMisplaced = 'rule-why-not-after-statement',
  WithoutExamples = 'rule-without-examples',
  ExamplesNotLast = 'rule-examples-not-last',
  ExamplesHoldProse = 'rule-examples-hold-prose',
  ExamplesHoldHeading = 'rule-examples-hold-heading',
  ExampleUntitled = 'rule-example-untitled',
  SectionUnknown = 'rule-section-unknown',
  FormsMixed = 'chapter-mixes-rule-forms',
}

interface RuleFormDetails {
  readonly [RuleFormCode.HeadingMisshapen]: {
    readonly heading: string;
  };
  readonly [RuleFormCode.WithoutTable]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.TablesMany]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.HeaderMisshapen]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.RowsNotOne]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.CellsMiscounted]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.HoldsLabel]: {
    readonly label: string;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.LevelRetired]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.WithoutWhySection]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.WhyMisplaced]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.WithoutExamples]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.ExamplesNotLast]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.ExamplesHoldProse]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.ExamplesHoldHeading]: {
    readonly heading: string;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.ExampleUntitled]: {
    readonly language: string;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.SectionUnknown]: {
    readonly heading: string;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.FormsMixed]: {
    readonly sectioned: RuleSlug;
    readonly tabled: RuleSlug;
  };
}

type RuleFormProblem = ProblemOf<RuleFormDetails>;

export type { RuleFormDetails, RuleFormProblem };
export { RuleFormCode };
