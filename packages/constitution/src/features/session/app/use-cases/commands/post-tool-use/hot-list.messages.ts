import type { RuleSlug } from '#/kernel/value-objects';

import type { CountedText } from '../../../utils';

const hotHeadingMessage = (paths: string): string =>
  `Rules most often broken in ${paths}; hold to them:`;

interface HotRuleLineInput {
  readonly firstSentence: string;
  readonly slug: RuleSlug;
}

const hotRuleLineMessage = (rule: HotRuleLineInput): string =>
  `- ${rule.slug}: ${rule.firstSentence}`;

const leftOutFilesText: CountedText = {
  many: (count) => `The hot rules of ${count} more files you changed did not fit here.`,
  one: 'The hot rules of 1 more file you changed did not fit here.',
};

export { hotHeadingMessage, hotRuleLineMessage, leftOutFilesText };
