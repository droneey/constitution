import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';

import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type {
  ConfigurationsReport,
  DeclaredRules,
  RulesSource,
  WorkingTree,
} from '../../../../contracts';
import { ConfigurationsCheckStatus } from '../../../../contracts';
import type { DigestSessionPorts } from '../digest-session.use-case';

const CORE_TEXT = '# core\n';
const version = Version.create('1.0.0');

// What a constitution.yaml that lists no block beyond core declares, its presets sound.
const QUIET = {
  active: [],
  activeCount: 1,
  configurations: {
    status: ConfigurationsCheckStatus.Checked,
    warnings: [],
  },
  listing: {
    overrides: [],
    repository: [],
    units: [],
  },
  musts: [],
  status: ConfigReadStatus.Parsed,
  warnings: [],
} as const satisfies DeclaredRules;

// The presets' report of a check that failed as one that cannot read them.
const unchecked: ConfigurationsReport = {
  reason: 'cannot list the presets',
  status: ConfigurationsCheckStatus.Unchecked,
};

interface SessionPortsInput {
  // the text of core, or the failure its read throws
  readonly core?: string | Error;
  readonly rules?: DeclaredRules;
  // the release the project pins, none installed where it is given as undefined
  readonly version?: Version | undefined;
  readonly workingTree?: WorkingTree;
}

// The ports a session's start reads through: the project around the start, quiet by default, its
// release installed, and a working tree git reports unless the case gives another.
const sessionPortsOf = (input: SessionPortsInput = {}): DigestSessionPorts => {
  const source: RulesSource = {
    find: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
      searchFrom === PROJECT || searchFrom.startsWith(`${PROJECT}/`) ? projectPlace : undefined,
    readCore: (): string => {
      const { core = CORE_TEXT } = input;

      if (core instanceof Error) {
        throw core;
      }

      return core;
    },
    readRules: (): DeclaredRules => input.rules ?? QUIET,
    versionOf: (): Version | undefined => ('version' in input ? input.version : version),
  };

  return {
    source,
    workingTree: input.workingTree ?? createFakeWorkingTree(),
  };
};

export { CORE_TEXT, QUIET, sessionPortsOf, unchecked, version };
