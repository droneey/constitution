import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import { TermKind } from '#/kernel/entities';
import { BlockId, Glob } from '#/kernel/value-objects';

import { blockFiles, chapterFile, rule } from '../../../__tests__/constitution.fixtures';
import { loadedOf } from '../../../application/use-cases/queries/check/__tests__/check.fixtures';
import { Constitution } from '../constitution.entity';

describe('Constitution.modelOf', () => {
  it('should give every block with its links, its rules, and the role terms of every file, a seam’s with its other block', () => {
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
            'Its parts sit in **`kit-parts/`**{#kit-part}.\n',
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
          isAbstract: false,
          languages: [],
          layer: Layer.Core,
          requires: [],
        },
        {
          governs: [],
          id: BlockId.create('ui'),
          isAbstract: false,
          languages: [],
          layer: Layer.Domain,
          requires: [],
        },
        {
          governs: [],
          id: BlockId.create('_runtime'),
          isAbstract: true,
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
          isAbstract: false,
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
        {
          axis: Axis.Foundation,
          block: BlockId.create('ui'),
          id: 'kit-part',
          kind: TermKind.Folder,
          seam: BlockId.create('kit'),
          term: 'kit-parts/',
        },
      ],
      rules: constitution.rules,
    });
  });
});
