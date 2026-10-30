import { describe, expect, it } from 'bun:test';

import { AbsolutePath, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import { PROJECT, unitOf } from '../../../../__tests__/presets.fixtures';
import type { PresetsFinding } from '../../../shared/entities';
import { PresetsCode } from '../../../shared/entities';
import type { RunAsked, UnitRun } from '../run-plan.entity';
import { EntryPoint, RunPlan } from '../run-plan.entity';

const units = [
  unitOf(),
  unitOf({
    path: 'packages/kit',
  }),
];

const runs: readonly UnitRun[] = [
  {
    commands: new Map([
      [
        EntryPoint.Check,
        [
          'bun run check',
        ],
      ],
      [
        EntryPoint.Test,
        [
          'bun run test',
        ],
      ],
    ]),
    unitPath: UnitPath.create(''),
  },
  {
    commands: new Map([
      [
        EntryPoint.Check,
        [
          'bun run check:kit',
        ],
      ],
    ]),
    unitPath: UnitPath.create('packages/kit'),
  },
];

const findingOf = (code: PresetsCode.Clash | PresetsCode.Missing): PresetsFinding =>
  code === PresetsCode.Clash
    ? {
        code,
        details: {
          settingPath: 'scripts.check',
          sources: [],
        },
        path: RepositoryRelativePath.create('package.json'),
      }
    : {
        code,
        details: {
          settingPaths: [],
        },
        path: RepositoryRelativePath.create('package.json'),
      };

const stepsOf = (asked: RunAsked): readonly (readonly string[])[] =>
  RunPlan.of({
    asked,
    findings: [],
    project: {
      repositoryFolderPath: AbsolutePath.create(PROJECT),
      units,
    },
    runs,
  }).steps.map(({ command, unitFolderPath, unitPath }) => [
    unitPath,
    unitFolderPath,
    command,
  ]);

describe('RunPlan.of', () => {
  it.each([
    {
      condition: 'the start is the root',
      expected: [
        [
          '',
          PROJECT,
          'bun run check',
        ],
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check:kit',
        ],
      ],
      start: PROJECT,
    },
    {
      condition: 'the start lies in a member',
      expected: [
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check:kit',
        ],
      ],
      start: `${PROJECT}/packages/kit/src`,
    },
    {
      condition: 'the start lies outside the project',
      expected: [
        [
          '',
          PROJECT,
          'bun run check',
        ],
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check:kit',
        ],
      ],
      start: '/elsewhere',
    },
  ])('should run the units the start lies in when $condition', ({ expected, start }) => {
    // Act
    const steps = stepsOf({
      entryPoint: EntryPoint.Check,
      startFolderPath: AbsolutePath.create(start),
    });

    // Assert
    expect(steps).toStrictEqual(expected);
  });

  it('should run the units asked for alone, of the entry point asked for', () => {
    // Act
    const steps = stepsOf({
      entryPoint: EntryPoint.Test,
      startFolderPath: AbsolutePath.create(`${PROJECT}/packages/kit`),
      unitPaths: [
        UnitPath.create(''),
      ],
    });

    // Assert
    expect(steps).toStrictEqual([
      [
        '',
        PROJECT,
        'bun run test',
      ],
    ]);
  });

  it('should keep only the findings that keep a run from being the presets’', () => {
    // Arrange
    const clash = findingOf(PresetsCode.Clash);

    // Act
    const plan = RunPlan.of({
      asked: {
        entryPoint: EntryPoint.Fix,
        startFolderPath: AbsolutePath.create(PROJECT),
      },
      findings: [
        clash,
        findingOf(PresetsCode.Missing),
      ],
      project: {
        repositoryFolderPath: AbsolutePath.create(PROJECT),
        units,
      },
      runs,
    });

    // Assert
    expect(plan).toStrictEqual({
      findings: [
        clash,
      ],
      steps: [],
    });
  });
});
