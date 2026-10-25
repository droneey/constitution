import type { PackPath } from '../value-objects';
import type { ProjectPlace } from './project-place.entity';
import type { Resolution } from './resolution.entity';

interface OpenedProject extends ProjectPlace {
  // the packs its units list, each once, in the order they are first listed
  readonly packs: readonly PackPath[];
  readonly resolution: Resolution;
}

enum ConfigReadStatus {
  Parsed = 'parsed',
  Unparsed = 'unparsed',
}

type Declaration =
  | {
      // the line, from 1, the grammar stops at
      readonly line: number;
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly packs: readonly PackPath[];
      readonly resolution: Resolution;
      readonly status: ConfigReadStatus.Parsed;
    };

export type { Declaration, OpenedProject };
export { ConfigReadStatus };
