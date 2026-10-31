import type { LoweringPlace, MustRule } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';

import type { SessionState } from '../../domain/entities';
import type { SessionStateWire } from './models';

const placeOf = (lowering: LoweringPlace): LoweringPlace => ({
  level: lowering.level,
  unit: lowering.unit,
  // Stryker disable next-line ConditionalExpression: JSON leaves out a field set to undefined, so the state written is the same either way
  ...(lowering.via === undefined
    ? {}
    : {
        via: lowering.via,
      }),
});

const mustWireOf = (must: MustRule): MustRule => ({
  block: must.block,
  lowerings: must.lowerings.map(placeOf),
  slug: must.slug,
});

const wireOfState = (state: SessionState): SessionStateWire => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: an unparsed state holds no MUST rules, and JSON leaves out the absent list the mapping would give it
  if (state.status === ConfigReadStatus.Unparsed) {
    return state;
  }

  const { mustsBesideCore, ...rest } = state;

  return {
    ...rest,
    musts: mustsBesideCore.map(mustWireOf),
  };
};

export { wireOfState };
