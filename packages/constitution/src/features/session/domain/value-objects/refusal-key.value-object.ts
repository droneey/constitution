import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { hexadecimalDigest } from '../constants';
import { SessionValueFailure } from '../errors';

type RefusalKey = Brand<string, 'RefusalKey'>;

const RefusalKey: PatternedText<'RefusalKey'> = patternedTextOf({
  code: SessionValueFailure.RefusalKey,
  pattern: hexadecimalDigest,
});

export { RefusalKey };
