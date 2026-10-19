import { afterEach, describe, expect, it } from 'bun:test';

import { ZodError } from 'zod';

import { coreChaptersOf, layerBlocksOf } from '../blocks.adapter';
import { enterRepository } from './repository.fixtures';

const CORE = 'packages/constitution/blocks/core';

const PLACEMENT = [
  '# Placement',
  '',
  '- The base: [placement](placement.md), [code](code.md).',
  '- `architecture/`: [layers](architecture/layers.md).',
  '',
].join('\n');

const CORE_FILES = {
  [`${CORE}/architecture/layers.md`]: '# Layers\n',
  [`${CORE}/code.md`]: '# Code\n',
  [`${CORE}/core.md`]: '# Core\n',
};

const cardOf = (id: string, base: string): string =>
  `---\nid: ${id}\nextends: ${base}\n---\n\n# ${id}\n`;

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('coreChaptersOf', () => {
  it("should give core's chapters in the order placement lists them", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        ...CORE_FILES,
        [`${CORE}/placement.md`]: PLACEMENT,
      },
    }).leave;

    // Act
    const chapters = coreChaptersOf();

    // Assert
    expect(chapters).toStrictEqual([
      'placement',
      'code',
      'architecture/layers',
    ]);
  });

  it.each([
    {
      condition: 'leaves a chapter out',
      extra: {
        [`${CORE}/names.md`]: '# Names\n',
      },
      named: 'names',
      placement: PLACEMENT,
    },
    {
      condition: 'lists a chapter core does not have',
      extra: {},
      named: 'types',
      placement: `${PLACEMENT}- [types](types.md)\n`,
    },
    {
      condition: 'lists a chapter twice',
      extra: {},
      named: 'code twice',
      placement: `${PLACEMENT}- [code](code.md)\n`,
    },
  ])(
    'should stop the build, naming the entry, when placement $condition',
    ({ extra, named, placement }) => {
      // Arrange
      repository.leave = enterRepository({
        files: {
          ...CORE_FILES,
          ...extra,
          [`${CORE}/placement.md`]: placement,
        },
      }).leave;

      // Act
      const read = (): readonly string[] => coreChaptersOf();

      // Assert
      expect(read).toThrow(named);
    },
  );
});

describe('layerBlocksOf', () => {
  it('should list a layer by the names of its blocks, an abstract block right above those that extend it', () => {
    // Arrange
    const domains = 'packages/constitution/blocks/domains';
    repository.leave = enterRepository({
      files: {
        [`${domains}/_api/_api.md`]: cardOf('_api', 'null'),
        [`${domains}/access-control/access-control.md`]: cardOf('access-control', 'null'),
        [`${domains}/admin-api/admin-api.md`]: cardOf('admin-api', '_api'),
        [`${domains}/rest-api/rest-api.md`]: cardOf('rest-api', '_api'),
        [`${domains}/ui/ui.md`]: cardOf('ui', 'null'),
      },
    }).leave;

    // Act
    const blocks = layerBlocksOf('domains');

    // Assert
    expect(blocks).toStrictEqual([
      'access-control',
      '_api',
      'admin-api',
      'rest-api',
      'ui',
    ]);
  });

  it("should stop the build on the card's model when a card's base is no block's id", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/blocks/domains/ui/ui.md': cardOf('ui', '3'),
      },
    }).leave;

    // Act
    const read = (): readonly string[] => layerBlocksOf('domains');

    // Assert
    expect(read).toThrow(ZodError);
  });
});
