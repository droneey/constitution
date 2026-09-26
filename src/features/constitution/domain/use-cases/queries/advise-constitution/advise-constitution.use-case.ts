import type { Constitution } from '../../../entities';
import type { BlocksById } from '../../../utils';
import { roleCoverage } from './role-coverage.utils';
import { similarRules } from './similar-rules.utils';

const adviseConstitution = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly string[] => [
  ...roleCoverage(input),
  ...similarRules({
    byId: input.byId,
    rules: input.constitution.rules,
  }),
];

export { adviseConstitution };
