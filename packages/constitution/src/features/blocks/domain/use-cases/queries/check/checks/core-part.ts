import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';

import type { Check, CheckInput } from '../check.types';

enum CorePartCode {
  OverBudget = 'core-over-byte-budget',
}

interface CorePartDetails {
  readonly [CorePartCode.OverBudget]: {
    /** the most bytes the digest holds of core */
    readonly budget: number;
    readonly bytes: number;
  };
}

type CorePartFinding = FindingOf<CorePartDetails>;

const CORE_BUDGET = 3500;
const encoder = new TextEncoder();

// The hook gives core's passport, its front matter aside, whole in every session's
// digest, so its text keeps within a budget.
const corePartCheck: Check<CorePartFinding> = ({
  constitution,
}: CheckInput): readonly CorePartFinding[] =>
  constitution.blocks
    .filter((block) => block.layer === Layer.Core)
    .flatMap((block) => {
      const bytes = encoder.encode(`${block.passport.body.trim()}\n`).length;

      return bytes > CORE_BUDGET
        ? [
            {
              code: CorePartCode.OverBudget,
              details: {
                budget: CORE_BUDGET,
                bytes,
              },
              path: block.passport.path,
            },
          ]
        : [];
    });

export type { CorePartDetails };
export { CorePartCode, corePartCheck };
