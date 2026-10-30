import type { ConfigReadStatus } from '#/kernel/entities';
import type { PackPath } from '#/kernel/value-objects';

import type { ParseFailure } from '../project-config/project-config.entity';
import type { Resolution } from '../resolution/resolution.entity';

type Declaration =
  | (ParseFailure & {
      readonly status: ConfigReadStatus.Unparsed;
    })
  | {
      readonly packs: readonly PackPath[];
      readonly resolution: Resolution;
      readonly status: ConfigReadStatus.Parsed;
    };

export type { Declaration };
