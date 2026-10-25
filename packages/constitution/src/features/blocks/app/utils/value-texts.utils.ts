import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { TextsOf } from '#/shared/cli';

const SEAM_OF_NO_BLOCK_ID =
  "is a seam whose name is not a kebab-case block id; a seam is with/<block>.md, named after the other block's id";

const valueTexts: TextsOf<ValueFindingDetails> = {
  [ValueFailure.BlockId]: (details) => {
    if (details.site === ValueSite.SeamFile) {
      return SEAM_OF_NO_BLOCK_ID;
    }

    return details.site === ValueSite.FrontMatterId
      ? `front matter: id "${details.written}" is not a kebab-case block id`
      : `is a block folder named "${details.written}", which is not a kebab-case block id`;
  },
  [ValueFailure.Glob]: ({ written }) =>
    `front matter: governs lists ${JSON.stringify(written)}, which holds whitespace; the index separates globs with spaces`,
  [ValueFailure.PartAddress]: ({ written }) =>
    `binds the part "${written}", which is not a file name: it is empty or holds a "/"`,
  [ValueFailure.RuleSlug]: (details) => {
    if (details.site === ValueSite.TightenedRule) {
      return `rule "${details.rule}" tightens "${details.written}", which is not a kebab-case slug`;
    }

    return details.site === ValueSite.BoundRule
      ? `binds "${details.written}", which is not a kebab-case slug`
      : `rule "${details.written}" is not a kebab-case slug`;
  },
};

export { valueTexts };
