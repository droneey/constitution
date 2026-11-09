import type { ProblemOf } from '../types';
import type { RuleSlug } from '../value-objects';

enum RuleFormCode {
  HeadingMisshapen = 'rule-heading-misshapen',
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
}

interface RuleFormDetails {
  readonly [RuleFormCode.HeadingMisshapen]: {
    readonly heading: string;
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
}

type RuleFormProblem = ProblemOf<RuleFormDetails>;

export type { RuleFormDetails, RuleFormProblem };
export { RuleFormCode };
