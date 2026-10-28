import { RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { compareText, normalizePath } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';
import {
  AbsolutePath,
  BlockSource,
  PackPath,
  RepositoryRelativePath,
  UnitRelativePath,
} from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import type { PresetsPlan, PresetsProject } from '../../../entities';
import { PresetEntry, PresetsFinding } from '../../../entities';
import { EntryTarget, TargetKind } from '../../../value-objects';
import { checkPresetSets, PackRoleNaming } from '../check-preset-sets';
import { loadPresetSets } from '../load-preset-sets';
import { mergeEntries } from './steps/merge-entries';
import { resolveFacts } from './steps/resolve-facts';
import { selectEntries } from './steps/select-entries';
import { splitRuns } from './steps/split-runs';

interface ComputePresetsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly project: PresetsProject;
}

const releaseFolderPathFromRepository = RepositoryRelativePath.create(RELEASE_FOLDER_PATH);

interface Written {
  readonly block: BlockId;
  readonly pathInUnit: UnitRelativePath;
}

const writtenOf = (input: { entry: PresetEntry; model: BlockModel }): readonly Written[] => {
  const { entry } = input;

  switch (entry.kind) {
    case TargetKind.File: {
      const writtenPath = PresetEntry.writtenPathOf({
        entry,
        model: input.model,
      });

      return writtenPath === undefined || !EntryTarget.staysInItsUnit(entry)
        ? []
        : PresetEntry.blocksCommentsNameOf(entry).map((block) => ({
            block,
            pathInUnit: UnitRelativePath.create(normalizePath(writtenPath)),
          }));
    }
    case TargetKind.Run:
      return [];
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return entry satisfies never;
  }
};

const blockIdsOf = (input: {
  entries: readonly PresetEntry[];
  model: BlockModel;
}): PresetsPlan['blockIds'] => {
  const written = input.entries.flatMap((entry) =>
    writtenOf({
      entry,
      model: input.model,
    }),
  );

  return new Map(
    [
      ...Map.groupBy(written, ({ pathInUnit }) => pathInUnit),
    ].map(([pathInUnit, writers]) => [
      pathInUnit,
      [
        ...new Set(writers.map(({ block }) => block)),
      ],
    ]),
  );
};

const computePresets = (input: ComputePresetsInput): PresetsPlan => {
  const { files, parser, project } = input;
  const { model, units } = project;
  const loaded = [
    loadPresetSets({
      files,
      parser,
      source: BlockSource.create(),
      sourceFolderPath: project.releaseFolderPath,
      sourceFolderPathFromRepository: releaseFolderPathFromRepository,
    }),
    ...project.packs.map((pack) =>
      loadPresetSets({
        files,
        parser,
        source: BlockSource.create(pack),
        sourceFolderPath: AbsolutePath.join(project.repositoryFolderPath, PackPath.normalOf(pack)),
        sourceFolderPathFromRepository: RepositoryRelativePath.create(PackPath.normalOf(pack)),
      }),
    ),
  ];
  const entries = loaded.flatMap((one) => one.entries).toSorted(PresetEntry.orderOf(model));
  const candidates = selectEntries({
    entries,
    model,
    units,
  });
  const resolved = resolveFacts({
    candidates,
    files,
    model,
    repositoryFolderPath: project.repositoryFolderPath,
    units,
  });
  const merged = mergeEntries({
    resolved: resolved.candidates,
  });
  const split = splitRuns({
    candidates,
    entries,
    merged: merged.candidates,
    units,
  });

  return {
    blockIds: blockIdsOf({
      entries,
      model,
    }),
    files: split.files.toSorted((left, right) => compareText(left.filePath, right.filePath)),
    runs: split.runs,
    findings: PresetsFinding.eachOnce([
      ...loaded.flatMap((one) => one.findings),
      ...checkPresetSets({
        entries,
        formats: input.formats,
        model,
        packRoleNaming: PackRoleNaming.ByIdOrName,
        release: {
          distributed: input.distribution.builtFilesOf(project.releaseFolderPath),
          files,
          folderPath: project.releaseFolderPath,
          folderPathFromRepository: releaseFolderPathFromRepository,
        },
      }),
      ...resolved.findings,
      ...merged.findings,
      ...split.findings,
    ]),
  };
};

export type { ComputePresetsInput };
export { computePresets };
