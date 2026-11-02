import type { Brand } from '#/kernel/types';
import type { PatternedText } from '#/kernel/utils';
import { patternedTextOf } from '#/kernel/utils';

import { SessionValueFailure } from '../../shared/errors';
import { ONE_LINE } from '../constants';

type TreeFingerprint = Brand<string, 'TreeFingerprint'>;

const TreeFingerprint: PatternedText<'TreeFingerprint'> = patternedTextOf({
  code: SessionValueFailure.TreeFingerprint,
  pattern: ONE_LINE,
});

export { TreeFingerprint };
