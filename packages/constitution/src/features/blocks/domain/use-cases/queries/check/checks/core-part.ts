import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';

import type { Check, CheckInput } from '../check.types';

enum CorePartCode {
  OverBudget = 'core-over-byte-budget',
}

interface CorePartDetails {
  readonly [CorePartCode.OverBudget]: {
    readonly budget: number;
    readonly bytes: number;
  };
}

type CorePartFinding = FindingOf<CorePartDetails>;

const CORE_BUDGET = 3500;
const encoder = new TextEncoder();

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
