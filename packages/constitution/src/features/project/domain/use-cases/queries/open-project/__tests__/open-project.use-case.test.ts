import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { Axis, Layer } from '#/kernel/constants';
import { WarningKind } from '#/kernel/entities';
import { ProjectFailure } from '#/kernel/errors';
import { SourceKind } from '#/kernel/value-objects';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  configPath,
  parsers,
  projectTreeOf,
  ruleOf,
} from '../../../../../__tests__/project.fixtures';
import { createFakeWorkspace } from '../../../../../__tests__/workspace.fake';
import {
  activeOf,
  catalogueEntryOf,
  failureOf,
  listedOf,
  listingOf,
  memberYamlOf,
  mustOf,
  today,
  unitListingOf,
  unitOf,
  yamlOf,
} from '../../read-declaration/steps/resolve-declaration/__tests__/resolution.fixtures';
import { openProject } from '../open-project.use-case';

const uiRules = ruleOf({
  level: 'MUST',
  slug: 'inputs-are-labelled',
});

describe('openProject', () => {
  it('should open the project around the start folder with what it declares resolved when it has a release', () => {
    // Arrange
    const text = yamlOf({
      axes: 'axes: [workflow]',
      check: 'check: bun run check',
      domains: 'domains: [ui]',
    });
    const web = memberYamlOf({
      axes: 'axes: [workflow]',
      domains: 'domains: [ui]',
    });
    const files = createFakeProjectFiles(
      projectTreeOf({
        blocks: [
          {
            body: uiRules,
            id: 'ui',
          },
        ],
        config: text,
        files: {
          [`${PROJECT}/apps/web/constitution.yaml`]: web,
          [`${PROJECT}/apps/web/src/main.ts`]: 'export {};\n',
        },
      }),
    );

    // Act
    const opened = openProject({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      start: `${PROJECT}/apps/web/src`,
      workspace: createFakeWorkspace([
        'apps/web',
      ]),
    });

    // Assert
    expect(opened).toStrictEqual({
      releaseFolder: releaseFolderPath,
      packs: [],
      project: PROJECT,
      resolution: {
        active: [
          activeOf({
            files: [
              'blocks/domains/ui/ui.md',
            ],
            governs: [],
            id: 'ui',
          }),
          activeOf({
            files: [
              'blocks/domains/ui/ui.md',
            ],
            governs: [],
            id: 'ui',
            unit: 'apps/web',
          }),
        ],
        blocks: [
          catalogueEntryOf('core', Layer.Core),
          catalogueEntryOf('ui', Layer.Domain),
        ],
        check: 'bun run check',
        listing: listingOf({
          repository: [
            listedOf({
              id: 'ui',
              layer: Layer.Domain,
            }),
          ],
          units: [
            unitListingOf({
              unit: 'apps/web',
            }),
          ],
        }),
        musts: [
          mustOf({
            block: 'ui',
            slug: 'inputs-are-labelled',
          }),
        ],
        units: [
          unitOf({
            axes: [
              Axis.Foundation,
              Axis.Workflow,
            ],
            blocks: [
              'core',
              'ui',
            ],
          }),
          unitOf({
            axes: [
              Axis.Foundation,
              Axis.Workflow,
            ],
            blocks: [
              'core',
              'ui',
            ],
            path: 'apps/web',
          }),
        ],
        warnings: [
          {
            details: {
              file: '/work/project/.droneey/constitution/blocks/core/core.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FrontMatterMissing,
          },
        ],
      },
    });
  });

  it.each([
    {
      code: ProjectFailure.NoProject,
      condition: 'no folder around the start holds constitution.yaml',
      line: undefined,
      path: '/work/elsewhere',
      start: '/work/elsewhere',
      tree: {
        files: {
          '/work/elsewhere/README.md': '# Elsewhere\n',
        },
      },
    },
    {
      code: ProjectFailure.ReleaseMissing,
      condition: 'the project has no release installed',
      line: undefined,
      path: releaseFolderPath,
      start: PROJECT,
      tree: {
        files: {
          [configPath]: yamlOf(),
          [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
        },
      },
    },
    {
      code: ProjectFailure.ConfigUnparsed,
      condition: 'constitution.yaml does not parse',
      line: 3,
      path: configPath,
      start: PROJECT,
      tree: projectTreeOf({
        config: 'axes: []\ndomains: []\n  - ui\n',
      }),
    },
  ])('should fail with $code when $condition', ({ code, line, path, start, tree }) => {
    // Arrange
    const files = createFakeProjectFiles(tree);

    // Act
    const failure = failureOf(() =>
      openProject({
        ...parsers(),
        clock: createFakeClock(today),
        files,
        start,
        workspace: createFakeWorkspace(),
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      cause: undefined,
      code,
      line,
      path,
    });
  });
});
