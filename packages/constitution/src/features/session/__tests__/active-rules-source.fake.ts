import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRead, ActiveRulesSource, ChapterRules } from '../application/contracts';
import { ActiveReadStatus } from '../application/contracts';
import { activeRulesOf, defaultFiles } from './gate.fixtures';

interface FakeActiveRulesSourceInput {
  readonly active?: ActiveRead;
  readonly activeByRelease?: Readonly<Record<string, ActiveRead>>;
  readonly files?: Readonly<Record<string, readonly RuleWording[]>>;
  readonly links?: Readonly<Record<string, AbsolutePath>>;
  readonly vocabularies?: Readonly<Record<string, readonly string[]>>;
}

const createFakeActiveRulesSource = (
  input: FakeActiveRulesSourceInput = {},
): ActiveRulesSource => ({
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    searchFrom === PROJECT || searchFrom.startsWith(`${PROJECT}/`)
      ? {
          ...projectPlace,
        }
      : undefined,
  readActive: (place: ProjectPlace): ActiveRead =>
    input.activeByRelease?.[place.releaseFolderPath] ??
    input.active ?? {
      rules: activeRulesOf(),
      status: ActiveReadStatus.Read,
    },
  realPathOf: (path: AbsolutePath): AbsolutePath => input.links?.[path] ?? path,
  rulesIn: (file: AbsolutePath): ChapterRules | undefined => {
    const wordings = (input.files ?? defaultFiles)[file];

    return wordings === undefined
      ? undefined
      : {
          definitions: input.vocabularies?.[file] ?? [],
          wordings,
        };
  },
});

export { createFakeActiveRulesSource };
