import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import { BlockId, BlockSource, PackPath, UnitPath } from '#/kernel/value-objects';

import type { DigestBlock, DigestFiles } from '../../../domain/session-digest/entities';
import { DigestEntryKind } from '../../../domain/session-digest/entities';
import { blockListLines } from '../block-list.utils';

const KEY =
  "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.";

const listedOf = (input: {
  files?: readonly DigestFiles[];
  id: string;
  layer: Layer;
  pack?: string;
}): DigestBlock => ({
  files: input.files ?? [],
  id: BlockId.create(input.id),
  layer: input.layer,
  source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
  summary: `The ${input.id} block.`,
});

describe('blockListLines', () => {
  it('should list the repository blocks by layer, what each member adds and leaves out', () => {
    // Arrange
    const listing = {
      overrides: [],
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
              kind: DigestEntryKind.Added,
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
              kind: DigestEntryKind.Own,
            },
            {
              block: listedOf({
                id: 'redux',
                layer: Layer.Implementation,
              }),
              kind: DigestEntryKind.Own,
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

  it('should give no line when no block or member is listed', () => {
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
