import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { AbsolutePath } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../domain/part-diagnosis/entities';
import { Diagnosis } from '../../../../../domain/part-diagnosis/entities';
import { createDoctorCommand } from '../doctor.cli';

const SOUND: PartDiagnosis = {
  kind: Diagnosis.HooksInstalled,
} as const;

describe('createDoctorCommand', () => {
  it.each<{
    condition: string;
    diagnosis: PartDiagnosis;
    failures: number;
  }>([
    {
      condition: 'every part is sound or skipped',
      diagnosis: {
        kind: Diagnosis.HooksUnconfigured,
      },
      failures: 0,
    },
    {
      condition: 'a part is worth a look',
      diagnosis: {
        kind: Diagnosis.HooksMissing,
      },
      failures: 1,
    },
    {
      condition: 'a part is broken',
      diagnosis: {
        kind: Diagnosis.ManifestUnreadable,
        manifest: AbsolutePath.create('/work/.droneey/constitution/package.json'),
      },
      failures: 1,
    },
  ])(
    'should diagnose the folder it runs in and print every part when $condition',
    async ({ diagnosis, failures }) => {
      // Arrange
      const asked: string[] = [];
      const { context, record } = createFakeContext();
      const command = createDoctorCommand({
        ...context,
        diagnoseInstallation: async (
          startFolderPath: AbsolutePath,
        ): Promise<readonly PartDiagnosis[]> => {
          asked.push(startFolderPath);

          return await Promise.resolve([
            SOUND,
            diagnosis,
          ]);
        },
      });

      // Act
      await runCommand({
        args: [],
        command,
      });

      // Assert
      expect({
        asked,
        failures: record().failures,
        label: record().ran[0]?.label,
        printed: record().printed.length,
      }).toStrictEqual({
        asked: [
          '/work/project/package',
        ],
        failures,
        label: 'Installation',
        printed: 1,
      });
    },
  );
});
