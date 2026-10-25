import type { ValueFailure } from '../errors';

/** Where a value the Constitution refuses is written, which its finding names. */
enum ValueSite {
  /** the id of a block's front matter */
  FrontMatterId = 'front-matter-id',
  /** the name of a block's folder */
  BlockFolder = 'block-folder',
  /** the name of a seam's file */
  SeamFile = 'seam-file',
  /** a glob of a block's governs */
  Governs = 'governs',
  /** a rule a bindings file binds */
  BoundRule = 'bound-rule',
  /** a part a bindings file binds */
  BoundPart = 'bound-part',
  /** the slug of a rule's heading */
  RuleHeading = 'rule-heading',
  /** the slug a rule's heading tightens */
  TightenedRule = 'tightened-rule',
}

/** The details of the findings that take the codes of the value objects. */
interface ValueFindingDetails {
  readonly [ValueFailure.BlockId]:
    | {
        readonly site: ValueSite.FrontMatterId | ValueSite.BlockFolder;
        readonly written: string;
      }
    | {
        readonly site: ValueSite.SeamFile;
      };
  readonly [ValueFailure.Glob]: {
    readonly site: ValueSite.Governs;
    readonly written: string;
  };
  readonly [ValueFailure.PartAddress]: {
    readonly site: ValueSite.BoundPart;
    readonly written: string;
  };
  readonly [ValueFailure.RuleSlug]:
    | {
        readonly site: ValueSite.BoundRule | ValueSite.RuleHeading;
        readonly written: string;
      }
    | {
        /** the slug of the rule whose heading tightens it */
        readonly rule: string;
        readonly site: ValueSite.TightenedRule;
        readonly written: string;
      };
}

export type { ValueFindingDetails };
export { ValueSite };
