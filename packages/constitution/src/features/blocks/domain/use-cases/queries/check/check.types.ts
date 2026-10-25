import type { Finding } from '#/kernel/types';

import type { BlockGraph, Constitution } from '../../../entities';

interface CheckInput {
  readonly constitution: Constitution;
  readonly graph: BlockGraph;
}

type Check = (input: CheckInput) => readonly Finding[];

export type { Check, CheckInput };
