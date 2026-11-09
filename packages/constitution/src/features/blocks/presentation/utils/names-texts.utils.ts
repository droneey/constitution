import type { TextsOf } from '#/shared/cli';

import type { NamesDetails } from '../../domain/validate-constitution/services';
import { NamesCode } from '../../domain/validate-constitution/services';

const namesTexts: TextsOf<NamesDetails> = {
  [NamesCode.CoreNamesProduct]: ({ name }) =>
    `names ${name}; core names no language, tool, library, product, vendor or version`,
  [NamesCode.ProductOutOfReach]: ({ name, owner }) =>
    `names ${name}, the subject of ${owner}, which its place does not reach; a block names a product only of itself or of a block it requires or sits under`,
  [NamesCode.ProductOfNoBlock]: ({ name }) =>
    `names ${name}, which no block holds; a rule on a product sits in that product's block`,
  [NamesCode.ParentNamesChild]: ({ child, name }) =>
    `names ${name}, the subject of its child ${child}; a parent block names nothing of its children`,
};

export { namesTexts };
