import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { WarningKind } from '#/kernel/entities';

import type { ConfigurationsCheck } from '../../../../../domain/entities';
import { PresetsCode } from '../../../../../domain/entities';
import { createPresetsCheckCommand } from '../check.cli';

const runOf = async (
  checked: ConfigurationsCheck | undefined,
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
      checkConfigurations: (start: string) => {
        asked.push(start);

        return checked;
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
      checked: {
        findings: [],
        warnings: [],
      },
      condition: 'the project is sound',
      failures: 0,
      status: StepStatus.Done,
    },
    {
      checked: {
        findings: [],
        warnings: [
          {
            details: {
              name: 'nope',
            },
            kind: WarningKind.NameUnknown,
          },
        ],
      },
      condition: 'the project has warnings',
      failures: 1,
      status: StepStatus.Warned,
    },
    {
      checked: {
        findings: [
          {
            code: PresetsCode.Missing,
            details: {
              settings: [
                'width',
              ],
            },
            path: 'biome.json',
          },
        ],
        warnings: [],
      },
      condition: 'its presets find something',
      failures: 1,
      status: StepStatus.Warned,
    },
    {
      checked: undefined,
      condition: 'no project lies around the folder',
      failures: 1,
      status: StepStatus.Failed,
    },
  ])(
    'should check the project around the folder it runs in when $condition',
    async ({ checked, failures, status }) => {
      // Act
      const run = await runOf(checked);

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
