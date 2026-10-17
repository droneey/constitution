import { Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import { BlockFileRole } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

const CORE_BUDGET = 3500;
const encoder = new TextEncoder();

// The hook gives core's card, its front matter aside, whole in every session's
// digest, so its text keeps within a budget.
const corePartCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks
    .filter((block) => block.layer === Layer.Core)
    .flatMap((block) => {
      const bytes = encoder.encode(
        // Stryker disable next-line OptionalChaining,ConditionalExpression,StringLiteral: a block's first file is its card
        `${(block.files.find((file) => file.role === BlockFileRole.Main)?.body ?? '').trim()}\n`,
      ).length;

      return bytes > CORE_BUDGET
        ? [
            {
              message: `makes a core part of ${bytes} bytes; the digest holds at most ${CORE_BUDGET} of core`,
              path: block.path,
            },
          ]
        : [];
    });

export { corePartCheck };
