import { describe, expect, it } from 'bun:test';

import { corePassport, PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { CORE_TEXT } from '#/__tests__/project-source.fake';
import type { ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, ReleaseStatus, WarningCode, WarningKind } from '#/kernel/entities';
import { isProjectError, ProjectError, ProjectFailure } from '#/kernel/errors';
import { PackPath, repositoryUnit, Version } from '#/kernel/value-objects';

import { CheckState, DigestKind, HookEventName, SessionOrigin } from '../../../../entities';
import { digestSession } from '../digest-session.use-case';
import { quiet, sessionPortsOf, uncheckedWiring, wiringOf } from './digest-session.fixtures';

const releaseFiles = {
  folder: releaseFolderPath,
  version: Version.create('1.0.0'),
};
const kept = {
  active: [],
  check: CheckState.create('bun run check'),
  musts: [],
  project: PROJECT,
  units: [
    repositoryUnit,
  ],
};
const unchecked: ProjectWarning = {
  code: WarningCode.Wiring,
  details: {},
  kind: WarningKind.WiringUnchecked,
};

// The code and the path of the ProjectError an act throws; undefined when it throws none.
const failureOf = (act: () => unknown): unknown => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return {
      code: error.code,
      path: error.details.path,
    };
  }
};

describe('digestSession', () => {
  it.each([
    {
      condition: 'a session starts up',
      event: HookEventName.SessionStart,
      isStartup: true,
      origin: SessionOrigin.Startup,
    },
    {
      condition: 'a session resumes',
      event: HookEventName.SessionStart,
      isStartup: false,
      origin: SessionOrigin.Resume,
    },
    {
      condition: 'a subagent starts',
      event: HookEventName.SubagentStart,
      isStartup: false,
      origin: SessionOrigin.Startup,
    },
  ])(
    'should warn of a wiring it cannot check, and give the state to keep, when $condition',
    ({ event, isStartup, origin }) => {
      // Arrange
      const ports = sessionPortsOf({
        wiring: uncheckedWiring,
      });

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin,
        searchFrom: PROJECT,
      });

      // Assert
      expect(digest).toStrictEqual({
        contents: {
          core: CORE_TEXT,
          count: 1,
          isStartup,
          kind: DigestKind.Resolved,
          listing: quiet.listing,
          release: releaseFiles,
          warnings: [
            unchecked,
          ],
        },
        state: kept,
      });
    },
  );

  it('should give the warnings of constitution.yaml before those of the wiring when both warn', () => {
    // Arrange
    const unknown: ProjectWarning = {
      code: WarningCode.Unknown,
      details: {
        name: 'nope',
      },
      kind: WarningKind.NameUnknown,
    };
    const ports = sessionPortsOf({
      project: {
        declaration: {
          packs: [
            PackPath.create('packs/acme'),
          ],
          resolution: {
            ...quiet,
            warnings: [
              unknown,
            ],
          },
          status: ConfigReadStatus.Parsed,
        },
      },
      wiring: wiringOf((opened) => [
        {
          code: WarningCode.Wiring,
          details: {
            member: opened.project,
            path: opened.releaseFolder,
            tool: opened.packs.join(', '),
          },
          kind: WarningKind.MemberNotSkipped,
        },
      ]),
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SubagentStart,
      origin: SessionOrigin.Startup,
      searchFrom: PROJECT,
    });

    // Assert
    expect(digest?.contents).toStrictEqual({
      core: CORE_TEXT,
      count: 1,
      isStartup: false,
      kind: DigestKind.Resolved,
      listing: quiet.listing,
      release: releaseFiles,
      warnings: [
        unknown,
        {
          code: WarningCode.Wiring,
          details: {
            member: PROJECT,
            path: releaseFolderPath,
            tool: 'packs/acme',
          },
          kind: WarningKind.MemberNotSkipped,
        },
      ],
    });
  });

  it.each([
    {
      condition: 'a session starts',
      event: HookEventName.SessionStart,
    },
    {
      condition: 'a subagent starts',
      event: HookEventName.SubagentStart,
    },
  ])(
    'should give core alone, and a state with no check, when constitution.yaml does not parse and $condition',
    ({ event }) => {
      // Arrange
      const ports = sessionPortsOf({
        project: {
          declaration: {
            line: 1,
            status: ConfigReadStatus.Unparsed,
          },
        },
      });

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin: SessionOrigin.Startup,
        searchFrom: PROJECT,
      });

      // Assert
      expect(digest).toStrictEqual({
        contents: {
          core: CORE_TEXT,
          kind: DigestKind.Unparsed,
          line: 1,
          release: releaseFiles,
        },
        state: {
          active: [],
          check: CheckState.unparsed(),
          musts: [],
          project: PROJECT,
          units: [],
        },
      });
    },
  );

  it('should point to doctor alone, and give no state, when no release is installed', () => {
    // Arrange
    const ports = sessionPortsOf({
      project: {
        release: {
          status: ReleaseStatus.Missing,
        },
      },
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      searchFrom: PROJECT,
    });

    // Assert
    expect(digest).toStrictEqual({
      contents: {
        kind: DigestKind.NoRelease,
        releaseFolder: releaseFolderPath,
      },
    });
  });

  it('should give nothing when no project lies around the start', () => {
    // Arrange
    const ports = sessionPortsOf();

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      searchFrom: '/elsewhere',
    });

    // Assert
    expect(digest).toBeUndefined();
  });

  it('should fail with the path of core when the source cannot read core', () => {
    // Arrange
    const ports = sessionPortsOf({
      project: {
        core: new ProjectError({
          code: ProjectFailure.CoreUnreadable,
          details: {
            path: corePassport,
          },
        }),
      },
    });

    // Act
    const failure = failureOf(() =>
      digestSession({
        ...ports,
        event: HookEventName.SessionStart,
        origin: SessionOrigin.Startup,
        searchFrom: PROJECT,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code: ProjectFailure.CoreUnreadable,
      path: corePassport,
    });
  });
});
