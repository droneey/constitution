import { z } from 'zod';

import type { MarkedReading } from '../../../domain/gate/entities';
import { ruleHashModel } from './gate-lines.model';
import { ruleSlugModel } from './session-state.model';

// Why: a part's list lies beside it under a name its rules' hash fixes, so another version of the
// program may find a list the one before it wrote, which is parsed tolerantly.
const partListModel: z.ZodType<MarkedReading> = z
  .looseObject({
    definitions: z.array(ruleHashModel),
    rules: z.array(
      z.looseObject({
        hash: ruleHashModel,
        slug: ruleSlugModel,
      }),
    ),
  })
  .transform(
    (held): MarkedReading => ({
      definitions: held.definitions,
      rules: held.rules.map((rule) => ({
        hash: rule.hash,
        slug: rule.slug,
      })),
    }),
  );

const partListText = (list: MarkedReading): string =>
  `${JSON.stringify({
    definitions: list.definitions,
    rules: list.rules.map((rule) => ({
      hash: rule.hash,
      slug: rule.slug,
    })),
  })}\n`;

export { partListModel, partListText };
