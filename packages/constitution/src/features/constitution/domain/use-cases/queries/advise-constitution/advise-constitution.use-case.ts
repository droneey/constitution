import type { Constitution } from '../../../entities';
import type { BlocksById } from '../../../utils';
import { similarRules } from './similar-rules.utils';

const adviseConstitution = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly string[] =>
  similarRules({
    byId: input.byId,
    rules: input.constitution.rules,
  });

export { adviseConstitution };
