import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';
import type { ListedBlock, ListedFiles } from '#/kernel/entities';
import { UnitEntryKind } from '#/kernel/entities';
import {
  BlockId,
  BlockSource,
  PackPath,
  RuleSlug,
  repositoryUnit,
  UnitPath,
} from '#/kernel/value-objects';

import { blockListLines } from '../block-list.utils';

const KEY =
  "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.";

const listedOf = (input: {
  files?: readonly ListedFiles[];
  id: string;
  layer: Layer;
  pack?: string;
}): ListedBlock => ({
  files: input.files ?? [],
  id: BlockId.create(input.id),
  layer: input.layer,
  source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
  summary: `The ${input.id} block.`,
});

describe('blockListLines', () => {
  it('should list the repository blocks by layer, what each member adds and leaves out, then the overrides', () => {
    // Arrange
    const listing = {
      overrides: [
        {
          level: Level.Should,
          rule: RuleSlug.create('inputs-are-labelled'),
          unit: repositoryUnit,
          until: Temporal.PlainDate.from('2026-07-01'),
        },
        {
          level: Level.May,
          rule: RuleSlug.create('themes-are-tokens'),
          unit: UnitPath.create('apps/web'),
        },
      ],
      repository: [
        listedOf({
          files: [
            {
              axis: Axis.Foundation,
              chapters: [
                'writing.md-files',
              ],
              seams: [
                BlockId.create('react'),
              ],
            },
            {
              axis: Axis.Architecture,
              chapters: [
                'layers',
              ],
              seams: [],
            },
          ],
          id: 'ui',
          layer: Layer.Domain,
        }),
        listedOf({
          id: 'browser',
          layer: Layer.Platform,
        }),
        listedOf({
          id: 'typescript',
          layer: Layer.Language,
        }),
        listedOf({
          id: 'react',
          layer: Layer.Implementation,
        }),
        listedOf({
          id: 'lint',
          layer: Layer.Implementation,
          pack: './rules',
        }),
      ],
      units: [
        {
          entries: [
            {
              files: [
                {
                  axis: Axis.Architecture,
                  chapters: [],
                  seams: [
                    BlockId.create('redux'),
                  ],
                },
                {
                  axis: Axis.Workflow,
                  chapters: [
                    'release',
                  ],
                  seams: [
                    BlockId.create('react'),
                  ],
                },
              ],
              id: BlockId.create('ui'),
              kind: UnitEntryKind.Added,
              layer: Layer.Domain,
            },
            {
              block: listedOf({
                files: [
                  {
                    axis: Axis.Workflow,
                    chapters: [
                      'deploy',
                    ],
                    seams: [],
                  },
                ],
                id: 'web',
                layer: Layer.Platform,
              }),
              kind: UnitEntryKind.Own,
            },
            {
              block: listedOf({
                id: 'redux',
                layer: Layer.Implementation,
              }),
              kind: UnitEntryKind.Own,
            },
          ],
          leftOutAxes: [],
          leftOutBlocks: [],
          unit: UnitPath.create('apps/web'),
        },
        {
          entries: [],
          leftOutAxes: [
            Axis.Architecture,
          ],
          leftOutBlocks: [
            BlockId.create('ui'),
            BlockId.create('browser'),
            BlockId.create('typescript'),
            BlockId.create('react'),
            BlockId.create('lint'),
          ],
          unit: UnitPath.create('apps/api'),
        },
        {
          entries: [],
          leftOutAxes: [],
          leftOutBlocks: [],
          unit: UnitPath.create('apps/docs'),
        },
      ],
    } as const;

    // Act
    const lines = blockListLines(listing);

    // Assert
    expect(lines).toStrictEqual([
      '## Domains (blocks/domains/<id>/<id>.md)',
      KEY,
      '- ui: The ui block. (writing.md-files, with/react; architecture: layers)',
      '## Platforms (blocks/contexts/platforms/<id>/<id>.md)',
      '- browser: The browser block.',
      '## Languages (blocks/contexts/languages/<id>/<id>.md)',
      '- typescript: The typescript block.',
      '## Implementations (blocks/implementations/<id>/<id>.md)',
      '- react',
      '- lint [./rules]',
      '## apps/web',
      '- ui [domains]: Also: architecture: with/redux; workflow: release, with/react',
      '- web [contexts/platforms]: The web block. (workflow: deploy)',
      '- redux [implementations]',
      '## apps/api',
      '- leaves out: ui, browser, typescript, react, lint, the architecture axis',
      '## Overrides',
      '- inputs-are-labelled: SHOULD until 2026-07-01',
      '- themes-are-tokens: MAY in apps/web',
    ]);
  });

  it('should name a block alone when its card gives no summary', () => {
    // Arrange
    const listing = {
      overrides: [],
      repository: [
        {
          files: [],
          id: BlockId.create('ui'),
          layer: Layer.Domain,
          source: BlockSource.create(),
        },
      ],
      units: [],
    };

    // Act
    const lines = blockListLines(listing);

    // Assert
    expect(lines).toStrictEqual([
      '## Domains (blocks/domains/<id>/<id>.md)',
      KEY,
      '- ui',
    ]);
  });

  it('should give no line when no block, member or override is listed', () => {
    // Arrange
    const listing = {
      overrides: [],
      repository: [],
      units: [],
    };

    // Act
    const lines = blockListLines(listing);

    // Assert
    expect(lines).toStrictEqual([]);
  });
});
