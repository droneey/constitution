import type { Finding } from '#/kernel';

import type { Constitution } from '../../../entities';
import type { BlocksById } from '../../../utils';

interface CheckInput {
  byId: BlocksById;
  constitution: Constitution;
}

type Check = (input: CheckInput) => readonly Finding[];

export type { Check, CheckInput };
