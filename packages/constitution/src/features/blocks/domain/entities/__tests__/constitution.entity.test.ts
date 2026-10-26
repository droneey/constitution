import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';
import { TermKind } from '#/kernel/entities';
import { BlockId, Glob, RuleSlug } from '#/kernel/value-objects';

import { blockFiles, chapterFile, loadedOf, rule } from '../../../__tests__/constitution.fixtures';
import { Constitution } from '../constitution.entity';

describe('Constitution.modelOf', () => {
  it('should give every block with its links, every rule with its axis and seam, and the role terms of every file', () => {
    // Arrange
    const { constitution } = loadedOf({
      ...blockFiles({
        body: 'A package keeps its source in **`src/`**{#source}.\n',
        dir: 'blocks/core',
        id: 'core',
      }),
      ...blockFiles({
        dir: 'blocks/domains/ui',
        files: {
          'architecture/screens.md': chapterFile(
            'Screens',
            'A screen lives in **`screens/`**{#screen}.\n',
            rule({
              level: 'SHOULD',
              slug: 'screens-stay-thin',
            }),
          ),
          'foundation/with/kit.md': chapterFile(
            'Kit',
            rule({
              slug: 'ui-uses-the-kit',
            }),
          ),
        },
        id: 'ui',
      }),
      ...blockFiles({
        abstract: true,
        dir: 'blocks/implementations/_runtime',
        id: '_runtime',
      }),
      ...blockFiles({
        dir: 'blocks/implementations/kit',
        extends: '_runtime',
        governs: [
          'kit.json',
        ],
        id: 'kit',
        languages: [
          'typescript',
        ],
        requires: [
          'ui',
        ],
      }),
    });

    // Act
    const model = Constitution.modelOf(constitution);

    // Assert
    expect(model).toStrictEqual({
      blocks: [
        {
          governs: [],
          id: BlockId.create('core'),
          languages: [],
          layer: Layer.Core,
          requires: [],
        },
        {
          governs: [],
          id: BlockId.create('ui'),
          languages: [],
          layer: Layer.Domain,
          requires: [],
        },
        {
          governs: [],
          id: BlockId.create('_runtime'),
          languages: [],
          layer: Layer.Implementation,
          requires: [],
        },
        {
          extends: BlockId.create('_runtime'),
          governs: [
            Glob.create('kit.json'),
          ],
          id: BlockId.create('kit'),
          languages: [
            BlockId.create('typescript'),
          ],
          layer: Layer.Implementation,
          requires: [
            BlockId.create('ui'),
          ],
        },
      ],
      roles: [
        {
          axis: Axis.Foundation,
          block: BlockId.create('core'),
          id: 'source',
          kind: TermKind.Folder,
          term: 'src/',
        },
        {
          axis: Axis.Architecture,
          block: BlockId.create('ui'),
          id: 'screen',
          kind: TermKind.Folder,
          term: 'screens/',
        },
      ],
      rules: [
        {
          axis: Axis.Architecture,
          block: BlockId.create('ui'),
          level: Level.Should,
          slug: RuleSlug.create('screens-stay-thin'),
        },
        {
          axis: Axis.Foundation,
          block: BlockId.create('ui'),
          level: Level.Must,
          seam: BlockId.create('kit'),
          slug: RuleSlug.create('ui-uses-the-kit'),
        },
      ],
    });
  });
});
