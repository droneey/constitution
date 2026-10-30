import { ConfigReadStatus } from '#/kernel/entities';

import { DigestKind, SessionDigest, SessionStart } from '../../../../domain/entities';
import type { RulesSource, WorkingTree } from '../../../contracts';

interface DigestSessionPorts {
  readonly source: RulesSource;
  readonly workingTree: WorkingTree;
}

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
      count: rules.activeInAnyUnitCount,
      isStartup: SessionStart.isStartup(input),
      kind: DigestKind.Resolved,
      listing: rules.listing,
      release: digestRelease,
      warnings: SessionDigest.warningsOf({
        configurations: rules.configurations,
        rules: rules.warnings,
        tree: input.workingTree.stateOf(repositoryFolderPath),
      }),
    },
    state: {
      active: rules.active,
      mustsBesideCore: rules.mustsBesideCore,
      repositoryFolderPath,
      status: ConfigReadStatus.Parsed,
    },
  };
};

export type { DigestSessionPorts };
export { digestSession };
