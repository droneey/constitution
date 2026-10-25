import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningCode, WarningKind } from '#/kernel/entities';
import { UnitPath } from '#/kernel/value-objects';

import { createPresetsCheckCommand } from '../check.cli';

const wiredNowhere: ProjectWarning = {
  code: WarningCode.Wiring,
  details: {
    tool: 'biome',
    unit: UnitPath.create(''),
  },
  kind: WarningKind.ToolWiredNowhere,
};

const runOf = async (
  warnings: readonly ProjectWarning[] | undefined,
): Promise<{
  asked: string[];
  detail: string | undefined;
  failures: number;
  label: string | undefined;
  status: StepStatus | undefined;
}> => {
  const asked: string[] = [];
  const { context, record } = createFakeContext();

  await runCommand({
    args: [],
    command: createPresetsCheckCommand({
      ...context,
      checkPresets: (start: string) => {
        asked.push(start);

        return warnings;
      },
    }),
    group: 'presets',
  });

  return {
    asked,
    failures: record().failures,
    detail: record().ran[0]?.outcome.detail,
    label: record().ran[0]?.label,
    status: record().ran[0]?.outcome.status,
  };
};

describe('createPresetsCheckCommand', () => {
  it.each([
    {
      condition: 'the project is sound',
      detail: 'constitution.yaml and its wiring are sound',
      failures: 0,
      status: StepStatus.Done,
      warnings: [],
    },
    {
      condition: 'the project has warnings',
      detail: '1 warning',
      failures: 1,
      status: StepStatus.Warned,
      warnings: [
        wiredNowhere,
      ],
    },
    {
      condition: 'no project lies around the folder',
      detail: 'no constitution.yaml in this folder or above it',
      failures: 1,
      status: StepStatus.Failed,
      warnings: undefined,
    },
  ])(
    'should check the project around the folder it runs in when $condition',
    async ({ detail, failures, status, warnings }) => {
      // Arrange
      const given = warnings;

      // Act
      const run = await runOf(given);

      // Assert
      expect(run).toStrictEqual({
        asked: [
          '/work/project/package',
        ],
        detail,
        failures,
        label: 'Presets',
        status,
      });
    },
  );
});
