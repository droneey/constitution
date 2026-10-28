import type { ConfigReadStatus } from '#/kernel/entities';
import type { PackPath } from '#/kernel/value-objects';

import type { ParseFailure } from './project-config.entity';
import type { Resolution } from './resolution.entity';

/** What the constitution.yaml of a project and of each member of its workspace declare. */
type Declaration =
  | (ParseFailure & {
      readonly status: ConfigReadStatus.Unparsed;
    })
  | {
      /** the packs its units list, each once, in the order they are first listed */
      readonly packs: readonly PackPath[];
      readonly resolution: Resolution;
      readonly status: ConfigReadStatus.Parsed;
    };

export type { Declaration };
