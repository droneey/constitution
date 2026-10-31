import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { hexadecimalDigest } from '../constants';
import { SessionValueFailure } from '../errors';

type RuleSetHash = Brand<string, 'RuleSetHash'>;

const RuleSetHash: PatternedText<'RuleSetHash'> = patternedTextOf({
  code: SessionValueFailure.RuleSetHash,
  pattern: hexadecimalDigest,
});

export { RuleSetHash };
