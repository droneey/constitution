import type { TextsOf } from '#/shared/cli';

import type { LinksDetails, ReferencesDetails } from '../../domain/services';
import { LinksCode, ReferencesCode } from '../../domain/services';

const referencesTexts: TextsOf<LinksDetails & ReferencesDetails> = {
  [LinksCode.MissingTarget]: ({ target }) => `links to a missing file "${target}"`,
  [ReferencesCode.LinkIntoOtherBlock]: ({ owner, target }) =>
    `links to ${target}, a file of the block ${owner}; a block refers to another only through its front matter and with/ file names`,
  [ReferencesCode.NamesOtherRule]: ({ owner, slug }) =>
    `names the rule ${slug} of ${owner}; a rule refers to another only as the parent in its heading`,
  [ReferencesCode.CitesDecision]: ({ decision }) =>
    `cites ${decision}; a block states its rules without citing the decision log`,
};

export { referencesTexts };
