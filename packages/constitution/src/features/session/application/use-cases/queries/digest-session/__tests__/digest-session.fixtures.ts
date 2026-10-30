import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';

import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ConfigurationsReport } from '../../../../../domain/session-digest/entities';
import { ConfigurationsCheckStatus } from '../../../../../domain/session-digest/entities';
import type { DeclaredRules, RulesSource, WorkingTree } from '../../../../contracts';
import type { DigestSessionPorts } from '../digest-session.use-case';

const CORE_TEXT = '# core\n';
const version = Version.create('1.0.0');

const QUIET = {
  active: [],
  activeInAnyUnitCount: 1,
  configurations: {
    status: ConfigurationsCheckStatus.Checked,
    warnings: [],
  },
  listing: {
    overrides: [],
    repository: [],
    units: [],
  },
  mustsBesideCore: [],
  status: ConfigReadStatus.Parsed,
  warnings: [],
} as const satisfies DeclaredRules;

const unchecked: ConfigurationsReport = {
  reason: 'cannot list the presets',
  status: ConfigurationsCheckStatus.Unchecked,
};

interface SessionPortsInput {
  readonly core?: string | Error;
  readonly rules?: DeclaredRules;
  readonly version?: Version | undefined;
  readonly workingTree?: WorkingTree;
}

const sessionPortsOf = (input: SessionPortsInput = {}): DigestSessionPorts => {
  const source: RulesSource = {
    findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
      searchFrom === PROJECT || searchFrom.startsWith(`${PROJECT}/`) ? projectPlace : undefined,
    readCorePassport: (): string => {
      const { core = CORE_TEXT } = input;

      if (core instanceof Error) {
        throw core;
      }

      return core;
    },
    readRules: (): DeclaredRules => input.rules ?? QUIET,
    pinnedVersionOf: (): Version | undefined => ('version' in input ? input.version : version),
  };

  return {
    source,
    workingTree: input.workingTree ?? createFakeWorkingTree(),
  };
};

export { CORE_TEXT, QUIET, sessionPortsOf, unchecked, version };
