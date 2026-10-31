import type { Version } from '#/kernel/value-objects';

import { createFakeRulesSource } from '../../../../../__tests__/rules-source.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ConfigurationsReport, DeclaredRules, WorkingTree } from '../../../../contracts';
import { ConfigurationsCheckStatus } from '../../../../contracts';
import type { DigestSessionPorts } from '../digest-session.use-case';

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
  const { workingTree, ...source } = input;

  return {
    source: createFakeRulesSource(source),
    workingTree: workingTree ?? createFakeWorkingTree(),
  };
};

export { sessionPortsOf, unchecked };
