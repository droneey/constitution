import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { hexadecimalDigest } from '../constants';
import { SessionValueFailure } from '../errors';

type RuleHash = Brand<string, 'RuleHash'>;

const RuleHash: PatternedText<'RuleHash'> = patternedTextOf({
  code: SessionValueFailure.RuleHash,
  pattern: hexadecimalDigest,
});

export { RuleHash };
