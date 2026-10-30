import { z } from 'zod';

import { LOWERED_LEVELS } from '#/kernel/constants';
import type { Lowering } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { SessionState } from '../../../domain/entities';

const absolutePathModel: z.ZodType<AbsolutePath, string> = z
  .string()
  .refine(AbsolutePath.is)
  .transform(AbsolutePath.create);

const blockIdModel: z.ZodType<BlockId, string> = z
  .string()
  .refine(BlockId.is)
  .transform(BlockId.create);

const globModel: z.ZodType<Glob, string> = z.string().refine(Glob.is).transform(Glob.create);

const ruleSlugModel: z.ZodType<RuleSlug, string> = z
  .string()
  .refine(RuleSlug.is)
  .transform(RuleSlug.create);

const unitPathModel: z.ZodType<UnitPath, string> = z
  .string()
  .refine(UnitPath.is)
  .transform(UnitPath.create);

const activeBlockModel = z.strictObject({
  files: z.array(z.string()).readonly(),
  governs: z.array(globModel).readonly(),
  id: blockIdModel,
  unit: unitPathModel,
});

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
  lowerings: z.array(loweringModel).readonly(),
  slug: ruleSlugModel,
});

const sessionStateModel = z.discriminatedUnion('status', [
  z.strictObject({
    repositoryFolderPath: absolutePathModel,
    status: z.literal(ConfigReadStatus.Unparsed),
  }),
  z
    .strictObject({
      active: z.array(activeBlockModel).readonly(),
      musts: z.array(mustRuleModel).readonly(),
      repositoryFolderPath: absolutePathModel,
      status: z.literal(ConfigReadStatus.Parsed),
    })
    .transform(({ musts, ...state }) => ({
      ...state,
      mustsBesideCore: musts,
    })),
]) satisfies z.ZodType<SessionState>;

type SessionStateWire = z.input<typeof sessionStateModel>;

export type { SessionStateWire };
export { sessionStateModel };
