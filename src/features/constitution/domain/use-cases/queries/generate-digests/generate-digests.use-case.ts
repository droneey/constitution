import type { Constitution, Digests } from '../../../entities';
import type { BlocksById } from '../../../utils';
import { corePartOf } from './core.utils';
import { indexOf } from './index.utils';

const generateDigests = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): Digests => {
  const core = corePartOf(input.constitution);

  return {
    core: core.text,
    findings: core.findings,
    index: indexOf(input),
  };
};

export { generateDigests };
