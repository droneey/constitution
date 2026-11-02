import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { AbsolutePath, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';
import type { CommandPlaces, Report } from '#/shared/cli';

import type {
  AppliedFiles,
  ApplyPlan,
  ApplyReport,
} from '../../../../../domain/apply-plan/entities';
import { ApplyPlanKind } from '../../../../../domain/apply-plan/entities';
import { ProjectRead, ProjectReadStatus } from '../../../../../domain/presets-project/entities';
import type { RunAsked, RunPlan } from '../../../../../domain/run-plan/entities';
import { EntryPoint } from '../../../../../domain/run-plan/entities';
import { PresetsCode } from '../../../../../domain/shared/entities';
import { applySectionsOf } from '../../../../utils';
import { createPresetsApplyCommand } from '../apply.cli';

const changes: AppliedFiles = {
  deletedFilePaths: [
    AbsolutePath.create('/work/project/packages/kit/notes.json'),
  ],
  files: [
    {
      filePath: AbsolutePath.create('/work/project/packages/kit/biome.json'),
      text: '{}\n',
    },
  ],
  locks: [],
};

const writtenReport: ApplyReport = {
  defaultsAddedToExistingFiles: [],
  deletedFilePaths: [],
  removedByApply: [],
  writtenUnitPaths: [
    UnitPath.create('packages/kit'),
  ],
  writtenFilePaths: [
    RepositoryRelativePath.create('packages/kit/biome.json'),
  ],
};

const written = ProjectRead.opened<ApplyPlan>({
  changes,
  kind: ApplyPlanKind.Ready,
  notes: [],
  report: writtenReport,
});

const found = ProjectRead.opened<ApplyPlan>({
  findings: [
    {
      code: PresetsCode.FileUnparsed,
      details: {},
      path: 'biome.json',
    },
  ],
  kind: ApplyPlanKind.Held,
});

const noProject: ProjectRead<never> = {
  status: ProjectReadStatus.NoProject,
};

const fixPlan: RunPlan = {
  findings: [],
  steps: [
    {
      command: 'bun run fix',
      unitFolderPath: AbsolutePath.create('/work/project/packages/kit'),
      unitPath: UnitPath.create('packages/kit'),
    },
  ],
};

const NAMED = /\S/;

const runOf = async (input: {
  args?: readonly string[];
  codes?: readonly number[];
  fix?: ProjectRead<RunPlan>;
  places?: Partial<CommandPlaces>;
  plan: ProjectRead<ApplyPlan>;
}) => {
  const applied: AppliedFiles[] = [];
  const asked: RunAsked[] = [];
  const commands: {
    command: string;
    folderPath: string;
  }[] = [];
  const startPaths: string[] = [];
  const codes = [
    ...(input.codes ?? []),
  ];
  const { context, record } = createFakeContext({
    places: input.places ?? {},
  });

  await runCommand({
    args: input.args ?? [],
    command: createPresetsApplyCommand({
      ...context,
      applyChanges: (given) => {
        applied.push(given);
      },
      planApply: (startFolderPath) => {
        startPaths.push(startFolderPath);

        return input.plan;
      },
      planRun: (asking) => {
        asked.push(asking);
        startPaths.push(asking.startFolderPath);

        return input.fix ?? ProjectRead.opened(fixPlan);
      },
      runCommand: ({ command, folderPath }) => {
        commands.push({
          command,
          folderPath,
        });

        return codes.shift() ?? 0;
      },
    }),
    group: 'presets',
  });

  return {
    applied,
    asked,
    commands,
    failures: record().failures,
    printed: record().printed,
    startPaths,
    steps: record().ran.map((ran) => [
      ran.label,
      ran.outcome.status,
    ]),
  };
};

describe('createPresetsApplyCommand', () => {
  it.each<{
    condition: string;
    places: Partial<CommandPlaces>;
    start: string;
  }>([
    {
      condition: 'Claude Code names the project',
      places: {
        cwd: '/work/project/package',
        projectDir: '/work/project',
      },
      start: '/work/project',
    },
    {
      condition: 'Claude Code names none',
      places: {
        cwd: '/work/project/package',
      },
      start: '/work/project/package',
    },
    {
      condition: 'Claude Code names the project by a path that does not open with "/"',
      places: {
        cwd: '/work/project/package',
        projectDir: 'app',
      },
      start: '/work/project/package/app',
    },
  ])(
    'should plan the apply, then its fix, from $start when $condition',
    async ({ places, start }) => {
      // Act
      const run = await runOf({
        places,
        plan: written,
      });

      // Assert
      expect(run.startPaths).toStrictEqual([
        start,
        start,
      ]);
    },
  );

  it('should write exactly the changes its plan returned when the plan finds nothing wrong', async () => {
    // Act
    const run = await runOf({
      plan: written,
    });

    // Assert
    expect(run.applied).toStrictEqual([
      changes,
    ]);
  });

  it.each<{
    condition: string;
    plan: ProjectRead<ApplyPlan>;
  }>([
    {
      condition: 'the plan is held by its findings',
      plan: found,
    },
    {
      condition: 'no project lies around the folder',
      plan: noProject,
    },
  ])('should write nothing when $condition', async ({ plan }) => {
    // Act
    const run = await runOf({
      plan,
    });

    // Assert
    expect(run.applied).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    plan: ProjectRead<ApplyPlan>;
    printed: Report[];
  }>([
    {
      condition: 'the plan finds nothing wrong',
      plan: written,
      printed: [
        applySectionsOf(written),
      ],
    },
    {
      condition: 'the plan reports findings',
      plan: found,
      printed: [
        applySectionsOf(found),
      ],
    },
    {
      condition: 'no project lies around the folder',
      plan: noProject,
      printed: [
        applySectionsOf(noProject),
      ],
    },
  ])('should print the report of the plan when $condition', async ({ plan, printed }) => {
    // Act
    const run = await runOf({
      plan,
    });

    // Assert
    expect(run.printed).toStrictEqual(printed);
  });

  it('should run the fix of each unit the apply wrote a file of, in its folder', async () => {
    // Act
    const run = await runOf({
      plan: written,
    });

    // Assert
    expect({
      asked: run.asked,
      commands: run.commands,
    }).toStrictEqual({
      asked: [
        {
          entryPoint: EntryPoint.Fix,
          startFolderPath: AbsolutePath.create('/work/project/package'),
          unitPaths: [
            UnitPath.create('packages/kit'),
          ],
        },
      ],
      commands: [
        {
          command: 'bun run fix',
          folderPath: '/work/project/packages/kit',
        },
      ],
    });
  });

  it.each([
    {
      args: [
        '--no-fix',
      ],
      condition: 'the run asks for no fix',
      plan: written,
    },
    {
      args: [],
      condition: 'the apply wrote no file',
      plan: ProjectRead.opened<ApplyPlan>({
        changes,
        kind: ApplyPlanKind.Ready,
        notes: [],
        report: {
          ...writtenReport,
          writtenUnitPaths: [],
          writtenFilePaths: [],
        },
      }),
    },
  ])('should run no fix and end the run as passed when $condition', async ({ args, plan }) => {
    // Act
    const run = await runOf({
      args,
      plan,
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
    }).toStrictEqual({
      commands: [],
      failures: 0,
    });
  });

  it('should end the run as failed when the fix fails', async () => {
    // Act
    const run = await runOf({
      codes: [
        2,
      ],
      plan: written,
    });

    // Assert
    expect(run.failures).toBe(1);
  });

  it('should run the apply as one step, done when it finds nothing wrong', async () => {
    // Act
    const run = await runOf({
      plan: written,
    });

    // Assert
    expect(run.steps).toStrictEqual([
      [
        expect.stringMatching(NAMED),
        StepStatus.Done,
      ],
    ]);
  });

  it.each([
    {
      condition: 'no project lies around the folder',
      plan: noProject,
    },
    {
      condition: 'the plan reports findings',
      plan: found,
    },
  ])('should end the run as failed, running no fix, when $condition', async ({ plan }) => {
    // Act
    const run = await runOf({
      plan,
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
    }).toStrictEqual({
      commands: [],
      failures: 1,
    });
  });

  it("should fail the presets' step and end the run as failed, running no fix, when the fix finds the project gone", async () => {
    // Act
    const run = await runOf({
      fix: noProject,
      plan: written,
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
      steps: run.steps,
    }).toStrictEqual({
      commands: [],
      failures: 1,
      steps: [
        [
          expect.stringMatching(NAMED),
          StepStatus.Done,
        ],
        [
          expect.stringMatching(NAMED),
          StepStatus.Failed,
        ],
      ],
    });
  });
});
