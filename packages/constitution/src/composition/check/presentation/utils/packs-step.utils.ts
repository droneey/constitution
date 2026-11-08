import { StepStatus } from '@droneey/design-cli';

import type { PackBase, Validation } from '#/features/blocks';
import { blocksSectionsOf, ValidationStage } from '#/features/blocks';
import { Level, PATH_SEPARATOR } from '#/kernel/constants';
import type { PackPath, RuleSlug } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';
import type { StepReport } from '#/shared/cli';
import { countOf } from '#/shared/cli';

import { FINDING, SOUND_PACKS } from './packs-step.messages';

interface PacksUnit {
  readonly loweredRules: ReadonlySet<RuleSlug>;
  readonly packs: readonly PackPath[];
}

interface PacksProject {
  readonly releaseFolderPath: AbsolutePath;
  readonly repositoryFolderPath: AbsolutePath;
  readonly units: readonly PacksUnit[];
}

interface PackCheckAsked {
  readonly base: PackBase;
  readonly folderPath: AbsolutePath;
  readonly lowered: ReadonlyMap<string, Level>;
}

interface PacksStepInput {
  readonly checkBlocks: (asked: PackCheckAsked) => Validation | undefined;
  readonly project: PacksProject;
}

interface PackChecked {
  readonly pack: PackPath;
  readonly validation: Validation;
}

const packsOf = (units: readonly PacksUnit[]): readonly PackPath[] => [
  ...new Set(units.flatMap((unit) => unit.packs)),
];

// Why: a unit that lowers a rule of placement lowers the findings that hold it in each pack it
// lists, to advice whatever level it names, since only a MUST fails.
const loweredFor = (input: {
  pack: PackPath;
  units: readonly PacksUnit[];
}): ReadonlyMap<string, Level> =>
  new Map(
    input.units
      .filter((unit) => unit.packs.includes(input.pack))
      .flatMap((unit) => [
        ...unit.loweredRules,
      ])
      .map((slug) => [
        slug,
        Level.Should,
      ]),
  );

const inPack = (pack: PackPath, validation: Validation): Validation => {
  const placed = <
    TFinding extends {
      readonly path: string;
    },
  >(
    findings: readonly TFinding[],
  ): readonly TFinding[] =>
    findings.map((finding) => ({
      ...finding,
      path: `${pack}${PATH_SEPARATOR}${finding.path}`,
    }));

  return validation.stage === ValidationStage.Checked
    ? {
        ...validation,
        advised: placed(validation.advised),
        findings: placed(validation.findings),
      }
    : {
        ...validation,
        findings: placed(validation.findings),
      };
};

const packsStepOf = (input: PacksStepInput): StepReport | undefined => {
  const { project } = input;
  const checked = packsOf(project.units).flatMap((pack): readonly PackChecked[] => {
    const validation = input.checkBlocks({
      base: {
        folder: project.releaseFolderPath,
        folderPath: project.releaseFolderPath,
      },
      folderPath: AbsolutePath.join(project.repositoryFolderPath, pack),
      lowered: loweredFor({
        pack,
        units: project.units,
      }),
    });

    return validation === undefined
      ? []
      : [
          {
            pack,
            validation: inPack(pack, validation),
          },
        ];
  });

  if (checked.length === 0) {
    return undefined;
  }

  const count = checked.reduce((sum, { validation }) => sum + validation.findings.length, 0);

  return {
    isFailed: count > 0,
    outcome:
      count === 0
        ? {
            detail: SOUND_PACKS,
            status: StepStatus.Done,
          }
        : {
            detail: countOf({
              count,
              noun: FINDING,
            }),
            status: StepStatus.Failed,
          },
    sections: checked.flatMap(({ validation }) => blocksSectionsOf(validation)),
  };
};

export type { PackCheckAsked, PacksProject };
export { packsStepOf };
