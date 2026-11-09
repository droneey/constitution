import type { TextsOf } from '#/shared/cli';

import type { LinksDetails, ReferencesDetails } from '../../domain/validate-constitution/services';
import { LinksCode, ReferencesCode } from '../../domain/validate-constitution/services';

const referencesTexts: TextsOf<LinksDetails & ReferencesDetails> = {
  [LinksCode.MissingTarget]: ({ target }) => `links to a missing file "${target}"`,
  [ReferencesCode.LinkIntoOtherBlock]: ({ owner, target }) =>
    `links to ${target}, a file of the block ${owner}, which its place does not reach; a block refers only to core, itself and the blocks it requires or sits under`,
  [ReferencesCode.NamesOtherRule]: ({ owner, slug }) =>
    `names the rule ${slug} of ${owner}, which its place does not reach; a block refers only to core, itself and the blocks it requires or sits under`,
  [ReferencesCode.CitesDecision]: ({ decision }) =>
    `cites ${decision}; a rule is read alone, without the decision log`,
};

export { referencesTexts };
