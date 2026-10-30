import type { ValueFailure } from '../../errors';

enum ValueSite {
  FrontMatterId = 'front-matter-id',
  BlockFolder = 'block-folder',
  SeamFile = 'seam-file',
  Governs = 'governs',
  RuleHeading = 'rule-heading',
  TightenedRule = 'tightened-rule',
}

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
        readonly rule: string;
        readonly site: ValueSite.TightenedRule;
        readonly written: string;
      };
}

export type { ValueFindingDetails };
export { ValueSite };
