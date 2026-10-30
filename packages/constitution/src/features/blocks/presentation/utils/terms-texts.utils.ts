import type { TextsOf } from '#/shared/cli';

import type { TermsDetails } from '../../domain/services';
import { TermsCode } from '../../domain/services';

const termsTexts: TextsOf<TermsDetails> = {
  [TermsCode.Misshapen]: ({ written }) =>
    `sets "${written}" in bold, which is neither plain words nor one code span; bold defines a term`,
  [TermsCode.DefinedTwice]: ({ firstBlock, firstFile, term }) =>
    `defines "${term}", which ${firstFile} of ${firstBlock} defines already; a term is defined once`,
  [TermsCode.OffAxis]: ({ axis, term, termAxis }) =>
    `uses "${term}", a term of the ${termAxis}; ${axis} holds whatever the ${termAxis}`,
  [TermsCode.OutOfReach]: ({ owner, term }) =>
    `uses "${term}", which ${owner} defines; only ${owner} and the blocks that build on it may`,
  [TermsCode.Misspelled]: ({ kind, owner, term, written }) =>
    `writes \`${written}\`, which ${owner} defines as \`${term}\`; a ${kind} keeps one spelling`,
  [TermsCode.WithoutId]: ({ term }) =>
    `defines "${term}" with no id after it; a folder or a suffix carries {#<id>}`,
  [TermsCode.IdRepeated]: ({ firstFile, firstTerm, id, term }) =>
    `gives "${term}" the id "${id}", which ${firstFile} gives "${firstTerm}" already; an id names one term`,
  [TermsCode.IdMisshapen]: ({ id, term }) =>
    `gives "${term}" the id "${id}"; an id is lower-case words and digits joined by hyphens, opening with a letter`,
};

export { termsTexts };
