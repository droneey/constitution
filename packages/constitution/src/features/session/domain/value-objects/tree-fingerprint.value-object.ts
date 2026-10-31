import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { ONE_LINE } from '../constants';
import { SessionValueFailure } from '../errors';

type TreeFingerprint = Brand<string, 'TreeFingerprint'>;

const TreeFingerprint: PatternedText<'TreeFingerprint'> = patternedTextOf({
  code: SessionValueFailure.TreeFingerprint,
  pattern: ONE_LINE,
});

export { TreeFingerprint };
