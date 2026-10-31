import type { ActiveBlock, ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, WarningKind } from '#/kernel/entities';

import type { ConfigurationsReport, RulesSource, TreeState, WorkingTree } from '../../../contracts';
import { ConfigurationsCheckStatus, TreeStateStatus } from '../../../contracts';
import type { KeptBlock, SessionDigest, SessionStart } from '../../../entities';
import { DigestKind, HookEventName, SessionOrigin } from '../../../entities';

interface DigestSessionPorts {
  readonly source: RulesSource;
  readonly workingTree: WorkingTree;
}

const presetsWarningsOf = (report: ConfigurationsReport): readonly ProjectWarning[] =>
  report.status === ConfigurationsCheckStatus.Checked
    ? report.warnings
    : [
        {
          details:
            report.reason === undefined
              ? {}
              : {
                  reason: report.reason,
                },
          kind: WarningKind.ConfigurationsUnchecked,
        },
      ];

const repositoryWarningsOf = (tree: TreeState): readonly ProjectWarning[] =>
  tree.status === TreeStateStatus.NoRepository
    ? [
        {
          details: {},
          kind: WarningKind.NoRepository,
        },
      ]
    : [];

const keptBlockOf = (block: ActiveBlock): KeptBlock => ({
  files: block.files.map((file) => file.path),
  governs: block.governs,
  id: block.id,
  unit: block.unit,
});

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const digestSession = (input: DigestSessionPorts & SessionStart): SessionDigest | undefined => {
  const { source } = input;
  const place = source.findProjectAround(input.searchFrom);

  if (place === undefined) {
    return undefined;
  }

  const { releaseFolderPath, repositoryFolderPath } = place;
  const version = source.pinnedVersionOf(place);

  if (version === undefined) {
    return {
      contents: {
        kind: DigestKind.NoRelease,
        releaseFolderPath,
      },
    };
  }

  const rules = source.readRules(place);
  const core = source.readCorePassport(place);

  const digestRelease = {
    folderPath: releaseFolderPath,
    version,
  };

  if (rules.status === ConfigReadStatus.Unparsed) {
    return {
      contents: {
        core,
        kind: DigestKind.Unparsed,
        lines: rules.lines,
        release: digestRelease,
      },
      state: {
        repositoryFolderPath,
        status: ConfigReadStatus.Unparsed,
      },
    };
  }

  return {
    contents: {
      core,
      isStartup:
        input.event === HookEventName.SessionStart && input.origin === SessionOrigin.Startup,
      kind: DigestKind.Resolved,
      listing: rules.listing,
      release: digestRelease,
      warnings: [
        ...rules.warnings,
        ...repositoryWarningsOf(input.workingTree.stateOf(repositoryFolderPath)),
        ...presetsWarningsOf(rules.configurations),
      ],
    },
    state: {
      active: rules.active.map(keptBlockOf),
      mustsBesideCore: rules.mustsBesideCore,
      repositoryFolderPath,
      status: ConfigReadStatus.Parsed,
    },
  };
};

export type { DigestSessionPorts };
export { digestSession };
