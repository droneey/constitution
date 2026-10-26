import type { ProjectSource } from '#/kernel/contracts';
import type { ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, ReleaseStatus, Resolution, WarningKind } from '#/kernel/entities';

import { PROJECT_CHECK } from '../../../constants';
import type { ConfigurationsReport, ProjectConfigurationsCheck } from '../../../contracts';
import { ConfigurationsCheckStatus } from '../../../contracts';
import type { SessionDigest, SessionStart } from '../../../entities';
import {
  CheckState,
  DigestKind,
  HookEventName,
  SessionOrigin,
  SessionState,
} from '../../../entities';

interface DigestSessionPorts {
  readonly configurations: ProjectConfigurationsCheck;
  readonly source: ProjectSource;
}

const uncheckedConfigurations: ProjectWarning = {
  details: {},
  kind: WarningKind.ConfigurationsUnchecked,
};

// Presets that cannot be checked cost their warnings, never the digest.
const presetsWarningsOf = (report: ConfigurationsReport): readonly ProjectWarning[] =>
  report.status === ConfigurationsCheckStatus.Checked
    ? report.warnings
    : [
        uncheckedConfigurations,
      ];

/**
 * The digest of the rules a session starts with, and the state its later hooks read; or undefined
 * when no project around the start declares any.
 *
 * @throws {@link ProjectError} when the release, constitution.yaml or core cannot be read
 */
const digestSession = (input: DigestSessionPorts & SessionStart): SessionDigest | undefined => {
  const { source } = input;
  const place = source.find(input.searchFrom);

  if (place === undefined) {
    return undefined;
  }

  const { project, releaseFolder } = place;
  const release = source.readRelease(place);

  if (release.status !== ReleaseStatus.Installed) {
    return {
      contents: {
        kind: DigestKind.NoRelease,
        releaseFolder,
      },
    };
  }

  const declaration = source.readDeclaration(place);
  const core = source.readCore(place);

  const digestRelease = {
    folder: releaseFolder,
    version: release.version,
  };

  if (declaration.status === ConfigReadStatus.Unparsed) {
    return {
      contents: {
        core,
        kind: DigestKind.Unparsed,
        line: declaration.line,
        release: digestRelease,
      },
      state: SessionState.create({
        active: [],
        check: CheckState.unparsed(),
        musts: [],
        project,
        units: [],
      }),
    };
  }

  const { packs, resolution } = declaration;

  return {
    contents: {
      core,
      count: Resolution.activeCountOf(resolution),
      isStartup:
        input.event === HookEventName.SessionStart && input.origin === SessionOrigin.Startup,
      kind: DigestKind.Resolved,
      listing: resolution.listing,
      release: digestRelease,
      warnings: [
        ...resolution.warnings,
        ...presetsWarningsOf(
          input.configurations.check({
            packs,
            project,
            releaseFolder,
            resolution,
          }),
        ),
      ],
    },
    state: SessionState.create({
      active: resolution.active,
      check: CheckState.create(PROJECT_CHECK),
      musts: resolution.musts,
      project,
      units: resolution.units.map((unit) => unit.path),
    }),
  };
};

export type { DigestSessionPorts };
export { digestSession };
