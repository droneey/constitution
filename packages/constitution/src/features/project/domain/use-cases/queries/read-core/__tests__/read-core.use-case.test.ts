import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { corePassport, projectPlace } from '#/__tests__/project-place.fixtures';
import { ProjectFailure } from '#/kernel/errors';

import { failureOf } from '../../read-declaration/steps/resolve-declaration/__tests__/resolution.fixtures';
import { readCore } from '../read-core.use-case';

const CORE_TEXT = '---\nid: core\n---\n\n# core\n';

describe('readCore', () => {
  it("should give the text of core's passport when the release holds it", () => {
    // Arrange
    const files = createFakeProjectFiles({
      files: {
        [corePassport]: CORE_TEXT,
      },
    });

    // Act
    const core = readCore({
      files,
      place: projectPlace,
    });

    // Assert
    expect(core).toBe(CORE_TEXT);
  });

  it.each([
    {
      cause: undefined,
      condition: 'the release holds no passport of core',
      tree: {
        files: {},
      },
    },
    {
      cause: expect.any(Error),
      condition: "core's passport cannot be read",
      tree: {
        files: {
          [corePassport]: CORE_TEXT,
        },
        unreadable: [
          corePassport,
        ],
      },
    },
  ])(
    'should fail with the path of the passport, keeping why the read failed, when $condition',
    ({ cause, tree }) => {
      // Arrange
      const files = createFakeProjectFiles(tree);

      // Act
      const failure = failureOf(() =>
        readCore({
          files,
          place: projectPlace,
        }),
      );

      // Assert
      expect(failure).toStrictEqual({
        cause,
        code: ProjectFailure.CoreUnreadable,
        line: undefined,
        path: corePassport,
      });
    },
  );
});
