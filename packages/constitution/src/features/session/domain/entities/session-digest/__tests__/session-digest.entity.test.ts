import { describe, expect, it } from 'bun:test';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';

import { TreeFingerprint } from '../../../value-objects';
import type { ConfigurationsReport } from '../../configurations-report';
import { ConfigurationsCheckStatus } from '../../configurations-report';
import type { TreeState } from '../../tree-state';
import { TreeStateStatus } from '../../tree-state';
import { SessionDigest } from '../session-digest.entity';

const ruleWarning: ProjectWarning = {
  details: {},
  kind: WarningKind.NoRepository,
};
const presetsWarning: ProjectWarning = {
  details: {},
  kind: WarningKind.ConfigurationsUnchecked,
};
const readTree: TreeState = {
  fingerprint: TreeFingerprint.create('tree-now'),
  status: TreeStateStatus.Read,
};

describe('SessionDigest.warningsOf', () => {
  it.each<{
    condition: string;
    configurations: ConfigurationsReport;
    expected: readonly ProjectWarning[];
    tree: TreeState;
  }>([
    {
      condition: 'the tree is read and the configurations are checked',
      configurations: {
        status: ConfigurationsCheckStatus.Checked,
        warnings: [
          presetsWarning,
        ],
      },
      expected: [
        ruleWarning,
        presetsWarning,
      ],
      tree: readTree,
    },
    {
      condition: 'no repository holds the project',
      configurations: {
        status: ConfigurationsCheckStatus.Checked,
        warnings: [],
      },
      expected: [
        ruleWarning,
        {
          details: {},
          kind: WarningKind.NoRepository,
        },
      ],
      tree: {
        status: TreeStateStatus.NoRepository,
      },
    },
    {
      condition: 'the configurations went unchecked for a reason',
      configurations: {
        reason: 'no lockfile',
        status: ConfigurationsCheckStatus.Unchecked,
      },
      expected: [
        ruleWarning,
        {
          details: {
            reason: 'no lockfile',
          },
          kind: WarningKind.ConfigurationsUnchecked,
        },
      ],
      tree: readTree,
    },
    {
      condition: 'the configurations went unchecked for no reason given',
      configurations: {
        status: ConfigurationsCheckStatus.Unchecked,
      },
      expected: [
        ruleWarning,
        {
          details: {},
          kind: WarningKind.ConfigurationsUnchecked,
        },
      ],
      tree: readTree,
    },
  ])(
    "should give the rules' warnings, then the tree's, then the configurations' when $condition",
    ({ configurations, expected, tree }) => {
      // Arrange
      const given = {
        configurations,
        rules: [
          ruleWarning,
        ],
        tree,
      };

      // Act
      const warnings = SessionDigest.warningsOf(given);

      // Assert
      expect(warnings).toStrictEqual(expected);
    },
  );
});
