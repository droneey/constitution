import type { ValueFailure } from '../errors';

/** Where a value the Constitution refuses is written, which its finding names. */
enum ValueSite {
  FrontMatterId = 'front-matter-id',
  BlockFolder = 'block-folder',
  SeamFile = 'seam-file',
  Governs = 'governs',
  RuleHeading = 'rule-heading',
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
  readonly [ValueFailure.RuleSlug]:
    | {
        readonly site: ValueSite.RuleHeading;
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
