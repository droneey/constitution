import { z } from 'zod';

import { LOWERED_LEVELS } from '#/kernel/constants';
import type { Lowering } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { SessionState } from '../../../domain/entities';

const absolutePathModel = z.string().refine(AbsolutePath.is).transform(AbsolutePath.create);

const blockIdModel = z.string().refine(BlockId.is).transform(BlockId.create);

const globModel = z.string().refine(Glob.is).transform(Glob.create);

const ruleSlugModel = z.string().refine(RuleSlug.is).transform(RuleSlug.create);

const unitPathModel = z.string().refine(UnitPath.is).transform(UnitPath.create);

const activeBlockModel = z.strictObject({
  files: z.array(z.string()),
  governs: z.array(globModel),
  id: blockIdModel,
  unit: unitPathModel,
});

// A lowering that names no rule it takes its level from leaves via out.
const loweringModel = z
  .strictObject({
    level: z.enum(LOWERED_LEVELS),
    unit: unitPathModel,
    via: ruleSlugModel.optional(),
  })
  .transform(
    ({ via, ...lowering }): Lowering =>
      via === undefined
        ? lowering
        : {
            ...lowering,
            via,
          },
  );

const mustRuleModel = z.strictObject({
  block: blockIdModel,
  lowerings: z.array(loweringModel),
  slug: ruleSlugModel,
});

/** The state a session keeps, as its file holds it: the state's own JSON. */
const sessionStateModel: z.ZodType<SessionState> = z.discriminatedUnion('status', [
  z.strictObject({
    repositoryFolderPath: absolutePathModel,
    status: z.literal(ConfigReadStatus.Unparsed),
  }),
  z.strictObject({
    active: z.array(activeBlockModel),
    musts: z.array(mustRuleModel),
    repositoryFolderPath: absolutePathModel,
    status: z.literal(ConfigReadStatus.Parsed),
  }),
]);

export { sessionStateModel };
