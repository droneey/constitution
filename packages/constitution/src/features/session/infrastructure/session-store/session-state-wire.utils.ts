import { ConfigReadStatus } from '#/kernel/entities';

import type { SessionState } from '../../domain/entities';
import type { SessionStateWire } from './models';

const wireOfState = (state: SessionState): SessionStateWire => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: an unparsed state holds no MUST rules, and JSON leaves out the absent list the mapping would give it
  if (state.status === ConfigReadStatus.Unparsed) {
    return state;
  }

  const { mustsBesideCore, ...rest } = state;

  return {
    ...rest,
    musts: mustsBesideCore,
  };
};

export { wireOfState };
