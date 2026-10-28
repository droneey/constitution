import type { ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, WarningKind } from '#/kernel/entities';

import type { ConfigurationsReport, RulesSource, TreeState, WorkingTree } from '../../../contracts';
import { ConfigurationsCheckStatus, TreeStateStatus } from '../../../contracts';
import type { SessionDigest, SessionStart } from '../../../entities';
import { DigestKind, HookEventName, SessionOrigin } from '../../../entities';

interface DigestSessionPorts {
  readonly source: RulesSource;
  readonly workingTree: WorkingTree;
}

// Presets that cannot be checked cost their warnings, never the digest.
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

// A project in no repository has no hand-back gate; a failure of git is told by the gate itself.
const repositoryWarningsOf = (tree: TreeState): readonly ProjectWarning[] =>
  tree.status === TreeStateStatus.NoRepository
    ? [
        {
          details: {},
          kind: WarningKind.NoRepository,
        },
      ]
    : [];

/**
 * The digest of the rules a session starts with, and the state its later hooks read; or undefined
 * when no project around the start declares any. Lets through the source's failure to read
 * constitution.yaml, the release's blocks or core.
 */
const digestSession = (input: DigestSessionPorts & SessionStart): SessionDigest | undefined => {
  const { source } = input;
  const place = source.find(input.searchFrom);

  if (place === undefined) {
    return undefined;
  }

  const { releaseFolderPath, repositoryFolderPath } = place;
  const version = source.versionOf(place);

  if (version === undefined) {
    return {
      contents: {
        kind: DigestKind.NoRelease,
        releaseFolderPath,
      },
    };
  }

  const rules = source.readRules(place);
  const core = source.readCore(place);

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
      count: rules.activeCount,
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
      active: rules.active,
      musts: rules.musts,
      repositoryFolderPath,
      status: ConfigReadStatus.Parsed,
    },
  };
};

export type { DigestSessionPorts };
export { digestSession };
