import { describe, expect, it } from 'bun:test';

import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { Axis, Layer } from '#/kernel/constants';
import { WarningKind } from '#/kernel/entities';
import { AbsolutePath, SourceKind } from '#/kernel/value-objects';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  configPath,
  parsers,
  projectTreeOf,
  ruleOf,
} from '../../../../../__tests__/project.fixtures';
import {
  activeOf,
  listedOf,
  listingOf,
  modelOf,
  mustOf,
  today,
  unitListingOf,
  unitOf,
  yamlOf,
} from '../../../../../__tests__/resolution.fixtures';
import { createFakeWorkspace } from '../../../../../__tests__/workspace.fake';
import type { ProjectOpening } from '../../../../../domain/entities';
import { OpeningStatus } from '../../../../../domain/entities';
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
      domains: 'domains: [ui]',
    });
    const web = yamlOf({
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
      startFolderPath: AbsolutePath.create(`${PROJECT}/apps/web/src`),
      workspace: createFakeWorkspace([
        'apps/web',
      ]),
    });

    // Assert
    expect<object>(opened).toStrictEqual({
      project: {
        packs: [],
        releaseFolderPath,
        repositoryFolderPath: PROJECT,
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
          model: modelOf({
            blocks: [
              {
                id: 'core',
                layer: Layer.Core,
                summary: undefined,
              },
              {
                id: 'ui',
              },
            ],
            rules: [
              {
                block: 'ui',
                slug: 'inputs-are-labelled',
              },
            ],
          }),
          mustsBesideCore: [
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
      },
      status: OpeningStatus.Opened,
    });
  });

  it.each<{
    condition: string;
    expected: ProjectOpening;
    start: string;
    tree: FakeTree;
  }>([
    {
      condition: 'no folder around the start holds constitution.yaml',
      expected: {
        status: OpeningStatus.NoProject,
      },
      start: '/work/elsewhere',
      tree: {
        files: {
          '/work/elsewhere/README.md': '# Elsewhere\n',
        },
      },
    },
    {
      condition: 'the project has no release installed',
      expected: {
        releaseFolderPath: AbsolutePath.create(releaseFolderPath),
        status: OpeningStatus.ReleaseMissing,
      },
      start: PROJECT,
      tree: {
        files: {
          [configPath]: yamlOf(),
          [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
        },
      },
    },
    {
      condition: 'constitution.yaml does not parse',
      expected: {
        lines: [
          3,
        ],
        status: OpeningStatus.ConfigUnparsed,
      },
      start: PROJECT,
      tree: projectTreeOf({
        config: 'axes: []\ndomains: []\n  - ui\n',
      }),
    },
  ])('should tell why it cannot open the project when $condition', ({ expected, start, tree }) => {
    // Arrange
    const files = createFakeProjectFiles(tree);

    // Act
    const opening = openProject({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      startFolderPath: AbsolutePath.create(start),
      workspace: createFakeWorkspace(),
    });

    // Assert
    expect(opening).toStrictEqual(expected);
  });
});
