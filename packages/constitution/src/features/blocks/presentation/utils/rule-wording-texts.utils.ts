import type { TextsOf } from '#/shared/cli';

import type { WordingDetails } from '../../domain/validate-constitution/services';
import { WordingCode } from '../../domain/validate-constitution/services';

const ruleWordingTexts: TextsOf<WordingDetails> = {
  [WordingCode.SloganTooLong]: ({ slug, words }) =>
    `rule "${slug}" opens with a slogan of ${String(words)} words; a slogan holds at most 22`,
  [WordingCode.SloganUnscoped]: ({ slug }) =>
    `rule "${slug}" opens with a slogan that leaves its scope to an article; a slogan scopes its subjects by every, each or all`,
  [WordingCode.ExceptionMisplaced]: ({ slug }) =>
    `rule "${slug}" states an exception outside its last sentence, or in one not opened by "Exempt:"; the exceptions sit in one last Exempt sentence`,
  [WordingCode.ModalVerb]: ({ slug, verb }) =>
    `rule "${slug}" says "${verb}" in its statement; a rule is worded plainly, its level alone sets its force`,
  [WordingCode.WhyDashes]: ({ dashes, slug }) =>
    `rule "${slug}" has ${String(dashes)} dashes in its Why; one dash opens the reference it closes on, and an aside takes commas or parentheses`,
  [WordingCode.WhyUnclosed]: ({ slug }) => `rule "${slug}" has a Why that ends without a period`,
  [WordingCode.SlugJoinsWithAnd]: ({ slug }) =>
    `rule "${slug}" joins words with "and" in its slug; a rule holds one obligation, and two become two rules`,
};

export { ruleWordingTexts };
