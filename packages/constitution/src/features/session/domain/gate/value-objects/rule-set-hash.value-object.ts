import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { hexadecimalDigest } from '../../shared/constants';
import { SessionValueFailure } from '../../shared/errors';

type RuleSetHash = Brand<string, 'RuleSetHash'>;

const RuleSetHash: PatternedText<'RuleSetHash'> = patternedTextOf({
  code: SessionValueFailure.RuleSetHash,
  pattern: hexadecimalDigest,
});

export { RuleSetHash };
