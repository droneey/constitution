import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';

import type { DeclaredRules, RulesSource } from '../domain/contracts';
import { ConfigurationsCheckStatus } from '../domain/contracts';

const CORE_TEXT = '# core\n';
const version = Version.create('1.0.0');

const QUIET = {
  active: [],
  configurations: {
    status: ConfigurationsCheckStatus.Checked,
    warnings: [],
  },
  listing: {
    repository: [],
    units: [],
  },
  mustsBesideCore: [],
  status: ConfigReadStatus.Parsed,
  warnings: [],
} as const satisfies DeclaredRules;

interface FakeRulesSourceInput {
  readonly core?: string | Error;
  readonly rules?: DeclaredRules;
  readonly version?: Version | undefined;
}

const createFakeRulesSource = (input: FakeRulesSourceInput = {}): RulesSource => ({
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    searchFrom === PROJECT || searchFrom.startsWith(`${PROJECT}/`) ? projectPlace : undefined,
  readCorePassport: (): string => {
    const { core = CORE_TEXT } = input;

    if (core instanceof Error) {
      throw core;
    }

    return core;
  },
  pinnedVersionOf: (): Version | undefined => ('version' in input ? input.version : version),
  readRules: (): DeclaredRules => input.rules ?? QUIET,
});

export { CORE_TEXT, createFakeRulesSource, QUIET, version };
