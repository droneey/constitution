import type { Finding } from '#/kernel/types';

import type { BlockGraph, Constitution } from '../../../entities';

interface CheckInput {
  readonly constitution: Constitution;
  readonly graph: BlockGraph;
}

type Check<TFinding extends Finding = Finding> = (input: CheckInput) => readonly TFinding[];

export type { Check, CheckInput };
