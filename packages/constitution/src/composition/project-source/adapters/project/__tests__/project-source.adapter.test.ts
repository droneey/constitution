import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import {
  corePassport,
  PROJECT,
  projectPlace,
  releaseFolderPath,
} from '#/__tests__/project-place.fixtures';
import type { ProjectPorts } from '#/features/project';
import { ReleaseStatus } from '#/kernel/entities';
import { isProjectError, ProjectFailure } from '#/kernel/errors';
import { Version } from '#/kernel/value-objects';

import { createProjectSource } from '../project-source.adapter';

// A project whose constitution.yaml cannot be read, linked to a release of the format this program
// reads that holds core; no read below reaches a parser, the clock or the workspace.
const CORE_TEXT = '# core\n';

const files = createFakeProjectFiles({
  files: {
    [corePassport]: CORE_TEXT,
    [`${releaseFolderPath}/package.json`]: '{"constitutionFormat": 3, "version": "1.0.0"}\n',
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [`${PROJECT}/constitution.yaml`]: 'axes: []\n',
  },
  unreadable: [
    `${PROJECT}/constitution.yaml`,
  ],
});

const unreached = (): never => {
  throw new Error('not reached');
};

const ports: ProjectPorts = {
  cardParser: {
    card: unreached,
  },
  clock: {
    today: unreached,
  },
  configParser: {
    parse: unreached,
  },
  files,
  workspace: {
    membersOf: unreached,
  },
};

const failureOf = (act: () => unknown): ProjectFailure | undefined => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return error.code;
  }
};

describe('createProjectSource', () => {
  it('should find the project around the start folder through the project feature', () => {
    // Arrange
    const source = createProjectSource(ports);

    // Act
    const place = source.find(PROJECT);

    // Assert
    expect(place).toStrictEqual(projectPlace);
  });

  it('should read the release the project pins through the project feature', () => {
    // Arrange
    const source = createProjectSource(ports);

    // Act
    const release = source.readRelease(projectPlace);

    // Assert
    expect(release).toStrictEqual({
      status: ReleaseStatus.Installed,
      version: Version.create('1.0.0'),
    });
  });

  it("should read the text of core's passport through the project feature when the release holds it", () => {
    // Arrange
    const source = createProjectSource(ports);

    // Act
    const core = source.readCore(projectPlace);

    // Assert
    expect(core).toBe(CORE_TEXT);
  });

  it('should read what the project declares through the project feature, failing as it fails', () => {
    // Arrange
    const source = createProjectSource(ports);

    // Act
    const failure = failureOf(() => source.readDeclaration(projectPlace));

    // Assert
    expect(failure).toBe(ProjectFailure.ConfigUnreadable);
  });

  it('should open the project around the start folder through the project feature, failing as it fails', () => {
    // Arrange
    const source = createProjectSource(ports);

    // Act
    const failure = failureOf(() => source.open('/elsewhere'));

    // Assert
    expect(failure).toBe(ProjectFailure.NoProject);
  });
});
