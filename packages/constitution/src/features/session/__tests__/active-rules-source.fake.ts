import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRead, ActiveRulesSource } from '../domain/contracts';
import { ActiveReadStatus } from '../domain/contracts';
import { activeRulesOf, defaultFiles } from './gate.fixtures';

interface FakeActiveRulesSourceInput {
  readonly active?: ActiveRead;
  readonly activeByRelease?: Readonly<Record<string, ActiveRead>>;
  readonly files?: Readonly<Record<string, readonly RuleWording[]>>;
  readonly links?: Readonly<Record<string, AbsolutePath>>;
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
  rulesIn: (file: AbsolutePath): readonly RuleWording[] | undefined =>
    (input.files ?? defaultFiles)[file],
});

export { createFakeActiveRulesSource };
