import { z } from 'zod';

import type { BlockCard } from '../../../domain/contracts';

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
    abstract: z
      .union([
        z.literal(true),
        z.literal('true'),
      ])
      .transform(() => true)
      .catch(false),
    extends: textModel,
    governs: listModel,
    languages: listModel,
    requires: listModel,
    summary: textModel,
  })
  .transform(({ abstract, extends: base, governs, languages, requires, summary }) => ({
    ...(base === ''
      ? {}
      : {
          extends: base,
        }),
    governs,
    isAbstract: abstract,
    languages,
    requires,
    ...(summary === ''
      ? {}
      : {
          summary,
        }),
  }));

export { blockCardModel };
