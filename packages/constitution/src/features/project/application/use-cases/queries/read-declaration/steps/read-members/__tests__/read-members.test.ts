import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT } from '#/__tests__/project-place.fixtures';
import { AbsolutePath, UnitPath } from '#/kernel/value-objects';

import { parsers } from '../../../../../../../__tests__/project.fixtures';
import { yamlOf } from '../../../../../../../__tests__/resolution.fixtures';
import { createFakeWorkspace } from '../../../../../../../__tests__/workspace.fake';
import { MemberProblem } from '../../../../../../../domain/project-config/entities';
import { readMembers } from '../read-members';

describe('readMembers', () => {
  it("should read each member's own constitution.yaml and note why the others declare nothing when the workspace declares members", () => {
    // Arrange
    const files = createFakeProjectFiles({
      files: {
        [`${PROJECT}/apps/docs/constitution.yaml`]: 'domains: [ui\n',
        [`${PROJECT}/apps/web/constitution.yaml`]: yamlOf(),
        [`${PROJECT}/packages/ui/constitution.yaml`]: yamlOf(),
      },
      unreadable: [
        `${PROJECT}/packages/ui/constitution.yaml`,
      ],
    });

    // Act
    const members = readMembers({
      configParser: parsers().configParser,
      files,
      repositoryFolderPath: AbsolutePath.create(PROJECT),
      workspace: createFakeWorkspace([
        'apps/api',
        'apps/docs',
        'apps/web',
        'packages/ui',
      ]),
    });

    // Assert
    expect({
      declared: members.declared.map((unit): string => unit.path),
      unread: members.unread,
    }).toStrictEqual({
      declared: [
        'apps/web',
      ],
      unread: [
        {
          path: UnitPath.create('apps/api'),
          problem: MemberProblem.Missing,
        },
        {
          lines: [
            2,
          ],
          path: UnitPath.create('apps/docs'),
          problem: MemberProblem.Unparsed,
        },
        {
          path: UnitPath.create('packages/ui'),
          problem: MemberProblem.Unreadable,
        },
      ],
    });
  });
});
