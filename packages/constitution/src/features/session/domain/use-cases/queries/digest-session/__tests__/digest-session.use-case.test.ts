import { describe, expect, it } from 'bun:test';

import { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { ProjectWarning } from '#/kernel/entities';
import { ConfigReadStatus, WarningKind } from '#/kernel/entities';
import { AbsolutePath, BlockId, Glob, repositoryUnit, SourceKind } from '#/kernel/value-objects';

import { CORE_TEXT, QUIET, version } from '../../../../../__tests__/rules-source.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { ConfigurationsCheckStatus } from '../../../../contracts';
import { DigestKind, HookEventName, SessionOrigin } from '../../../../entities';
import { digestSession } from '../digest-session.use-case';
import { sessionPortsOf, unchecked } from './digest-session.fixtures';

const searchFrom = AbsolutePath.create(PROJECT);
const releaseFiles = {
  folderPath: AbsolutePath.create(releaseFolderPath),
  version: version,
};
const kept = {
  active: [],
  mustsBesideCore: [],
  repositoryFolderPath: AbsolutePath.create(PROJECT),
  status: ConfigReadStatus.Parsed,
};
const uncheckedWarning: ProjectWarning = {
  details: {
    reason: 'cannot list the presets',
  },
  kind: WarningKind.ConfigurationsUnchecked,
};
const uncheckedRules = {
  ...QUIET,
  configurations: unchecked,
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
    'should warn of presets it cannot check, and give the state to keep, when $condition',
    ({ event, isStartup, origin }) => {
      // Arrange
      const ports = sessionPortsOf({
        rules: uncheckedRules,
      });

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin,
        searchFrom,
      });

      // Assert
      expect(digest).toStrictEqual({
        contents: {
          core: CORE_TEXT,
          isStartup,
          kind: DigestKind.Resolved,
          listing: QUIET.listing,
          release: releaseFiles,
          warnings: [
            uncheckedWarning,
          ],
        },
        state: kept,
      });
    },
  );

  it('should keep each active block in the state with its files named by their paths', () => {
    // Arrange
    const ports = sessionPortsOf({
      rules: {
        ...QUIET,
        active: [
          {
            files: [
              {
                path: 'blocks/domains/ui/ui.md',
                source: SourceKind.Release,
              },
              {
                path: 'packs/acme/acme/acme.md',
                source: SourceKind.Pack,
              },
            ],
            governs: [
              Glob.create('src/**'),
            ],
            id: BlockId.create('ui'),
            unit: repositoryUnit,
          },
        ],
      },
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      searchFrom,
    });

    // Assert
    expect(digest?.state).toStrictEqual({
      ...kept,
      active: [
        {
          files: [
            'blocks/domains/ui/ui.md',
            'packs/acme/acme/acme.md',
          ],
          governs: [
            Glob.create('src/**'),
          ],
          id: BlockId.create('ui'),
          unit: repositoryUnit,
        },
      ],
    });
  });

  it('should warn that the gate cannot run, before the presets, when the project lies in no repository', () => {
    // Arrange
    const ports = sessionPortsOf({
      rules: uncheckedRules,
      workingTree: createFakeWorkingTree({
        repositoryFolderPath: '/work/elsewhere',
      }),
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      searchFrom,
    });

    // Assert
    expect(digest?.contents).toStrictEqual({
      core: CORE_TEXT,
      isStartup: true,
      kind: DigestKind.Resolved,
      listing: QUIET.listing,
      release: releaseFiles,
      warnings: [
        {
          details: {},
          kind: WarningKind.NoRepository,
        },
        uncheckedWarning,
      ],
    });
  });

  it('should warn of presets it cannot check, naming no reason, when the check gives none', () => {
    // Arrange
    const ports = sessionPortsOf({
      rules: {
        ...QUIET,
        configurations: {
          status: ConfigurationsCheckStatus.Unchecked,
        },
      },
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SubagentStart,
      origin: SessionOrigin.Startup,
      searchFrom,
    });

    // Assert
    expect(digest?.contents).toStrictEqual({
      core: CORE_TEXT,
      isStartup: false,
      kind: DigestKind.Resolved,
      listing: QUIET.listing,
      release: releaseFiles,
      warnings: [
        {
          details: {},
          kind: WarningKind.ConfigurationsUnchecked,
        },
      ],
    });
  });

  it('should give the warnings of constitution.yaml before those of the presets when both warn', () => {
    // Arrange
    const unknown: ProjectWarning = {
      details: {
        name: 'nope',
      },
      kind: WarningKind.NameUnknown,
    };
    const found: ProjectWarning = {
      details: {
        code: 'missing',
        file: 'biome.jsonc',
        says: 'lacks formatter.enabled',
      },
      kind: WarningKind.ConfigurationFinding,
    };
    const ports = sessionPortsOf({
      rules: {
        ...QUIET,
        configurations: {
          status: ConfigurationsCheckStatus.Checked,
          warnings: [
            found,
          ],
        },
        warnings: [
          unknown,
        ],
      },
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SubagentStart,
      origin: SessionOrigin.Startup,
      searchFrom,
    });

    // Assert
    expect(digest?.contents).toStrictEqual({
      core: CORE_TEXT,
      isStartup: false,
      kind: DigestKind.Resolved,
      listing: QUIET.listing,
      release: releaseFiles,
      warnings: [
        unknown,
        found,
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
    'should give core alone, and a state of no rules, when constitution.yaml does not parse and $condition',
    ({ event }) => {
      // Arrange
      const ports = sessionPortsOf({
        rules: {
          lines: [
            1,
          ],
          status: ConfigReadStatus.Unparsed,
        },
      });

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin: SessionOrigin.Startup,
        searchFrom,
      });

      // Assert
      expect(digest).toStrictEqual({
        contents: {
          core: CORE_TEXT,
          kind: DigestKind.Unparsed,
          lines: [
            1,
          ],
          release: releaseFiles,
        },
        state: {
          repositoryFolderPath: AbsolutePath.create(PROJECT),
          status: ConfigReadStatus.Unparsed,
        },
      });
    },
  );

  it('should point to doctor alone, and give no state, when no release is installed', () => {
    // Arrange
    const ports = sessionPortsOf({
      version: undefined,
    });

    // Act
    const digest = digestSession({
      ...ports,
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      searchFrom,
    });

    // Assert
    expect(digest).toStrictEqual({
      contents: {
        kind: DigestKind.NoRelease,
        releaseFolderPath: AbsolutePath.create(releaseFolderPath),
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
      searchFrom: AbsolutePath.create('/elsewhere'),
    });

    // Assert
    expect(digest).toBeUndefined();
  });

  it('should let a failure of the source through when it cannot read core', () => {
    // Arrange
    const failure = new Error('core unreadable');
    const ports = sessionPortsOf({
      core: failure,
    });

    // Act
    const act = (): unknown =>
      digestSession({
        ...ports,
        event: HookEventName.SessionStart,
        origin: SessionOrigin.Startup,
        searchFrom,
      });

    // Assert
    expect(act).toThrow(failure);
  });
});
