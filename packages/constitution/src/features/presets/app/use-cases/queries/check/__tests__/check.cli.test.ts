import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { UnitPath } from '#/kernel/value-objects';

import { createPresetsCheckCommand } from '../check.cli';

const wiredNowhere: ProjectWarning = {
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
    label: record().ran[0]?.label,
    status: record().ran[0]?.outcome.status,
  };
};

describe('createPresetsCheckCommand', () => {
  it.each([
    {
      condition: 'the project is sound',
      failures: 0,
      status: StepStatus.Done,
      warnings: [],
    },
    {
      condition: 'the project has warnings',
      failures: 1,
      status: StepStatus.Warned,
      warnings: [
        wiredNowhere,
      ],
    },
    {
      condition: 'no project lies around the folder',
      failures: 1,
      status: StepStatus.Failed,
      warnings: undefined,
    },
  ])(
    'should check the project around the folder it runs in when $condition',
    async ({ failures, status, warnings }) => {
      // Act
      const run = await runOf(warnings);

      // Assert
      expect(run).toStrictEqual({
        asked: [
          '/work/project/package',
        ],
        failures,
        label: 'Presets',
        status,
      });
    },
  );
});
