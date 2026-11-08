import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRules } from '../../domain/gate/entities';

enum ActiveReadStatus {
  Read = 'read',
  Unparsed = 'unparsed',
  NoRelease = 'no-release',
  Failed = 'failed',
}

type ActiveRead =
  | {
      readonly rules: ActiveRules;
      readonly status: ActiveReadStatus.Read;
    }
  | {
      readonly status: ActiveReadStatus.NoRelease;
    }
  | {
      readonly lines: readonly number[];
      readonly status: ActiveReadStatus.Unparsed;
    }
  | {
      readonly reason: string;
      readonly status: ActiveReadStatus.Failed;
    };

interface ChapterRules {
  readonly definitions: readonly string[];
  readonly wordings: readonly RuleWording[];
}

interface ActiveRulesSource {
  readonly findProjectAround: (searchFrom: AbsolutePath) => ProjectPlace | undefined;
  readonly readActive: (place: ProjectPlace) => ActiveRead;
  readonly realPathOf: (path: AbsolutePath) => AbsolutePath;
  readonly rulesIn: (file: AbsolutePath) => ChapterRules | undefined;
}

export type { ActiveRead, ActiveRulesSource, ChapterRules };
export { ActiveReadStatus };
