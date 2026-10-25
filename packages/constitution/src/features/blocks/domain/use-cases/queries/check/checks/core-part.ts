import { Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import type { Check, CheckInput } from '../check.types';

enum CorePartCode {
  OverBudget = 'core-over-byte-budget',
}

const CORE_BUDGET = 3500;
const encoder = new TextEncoder();

// The hook gives core's passport, its front matter aside, whole in every session's
// digest, so its text keeps within a budget.
const corePartCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks
    .filter((block) => block.layer === Layer.Core)
    .flatMap((block) => {
      const bytes = encoder.encode(`${block.passport.body.trim()}\n`).length;

      return bytes > CORE_BUDGET
        ? [
            {
              code: CorePartCode.OverBudget,
              message: `makes a core part of ${bytes} bytes; the digest holds at most ${CORE_BUDGET} of core`,
              path: block.passport.path,
            },
          ]
        : [];
    });

export { corePartCheck };
