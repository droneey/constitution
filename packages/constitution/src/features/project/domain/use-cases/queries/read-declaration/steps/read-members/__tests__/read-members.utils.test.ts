import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT } from '#/__tests__/project-place.fixtures';
import { UnitPath } from '#/kernel/value-objects';

import { parsers } from '../../../../../../../__tests__/project.fixtures';
import { createFakeWorkspace } from '../../../../../../../__tests__/workspace.fake';
import { MemberProblem } from '../../../../../../entities';
import { memberYamlOf } from '../../resolve-declaration/__tests__/resolution.fixtures';
import { readMembers } from '../read-members.utils';

describe('readMembers', () => {
  it("should read each member's own constitution.yaml and note why the others declare nothing when the workspace declares members", () => {
    // Arrange
    const files = createFakeProjectFiles({
      files: {
        [`${PROJECT}/apps/docs/constitution.yaml`]: 'domains: [ui\n',
        [`${PROJECT}/apps/web/constitution.yaml`]: memberYamlOf(),
        [`${PROJECT}/packages/ui/constitution.yaml`]: memberYamlOf(),
      },
      unreadable: [
        `${PROJECT}/packages/ui/constitution.yaml`,
      ],
    });

    // Act
    const members = readMembers({
      configParser: parsers().configParser,
      files,
      project: PROJECT,
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
          line: 1,
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
