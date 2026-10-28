import type { BlockModel } from '#/kernel/entities';
import type { Finding } from '#/kernel/types';

import type { BlockGraph, Constitution } from '../../../entities';

interface CheckInput {
  readonly constitution: Constitution;
  readonly graph: BlockGraph;
  /** the model of the blocks, a pack's base among them */
  readonly model: BlockModel;
}

type Check<TFinding extends Finding = Finding> = (input: CheckInput) => readonly TFinding[];

export type { Check, CheckInput };
