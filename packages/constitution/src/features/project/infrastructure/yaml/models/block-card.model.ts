import { z } from 'zod';

import type { BlockCard } from '../../../domain/block-set/entities';

const textModel = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
  ])
  .transform(String)
  .catch('');

const listModel = z
  .union([
    z.array(textModel),
    textModel.transform((text) => [
      text,
    ]),
  ])
  .transform((texts) => texts.filter((text) => text !== ''));

const blockCardModel: z.ZodType<BlockCard> = z
  .looseObject({
    governs: listModel,
    languages: listModel,
    requires: listModel,
  })
  .transform(({ governs, languages, requires }) => ({
    governs,
    languages,
    requires,
  }));

export { blockCardModel };
