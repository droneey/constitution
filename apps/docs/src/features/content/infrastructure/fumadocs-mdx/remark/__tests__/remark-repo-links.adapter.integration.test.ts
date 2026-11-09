import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { VFile } from 'vfile';

import { RepositoryPath } from '../../../../domain/source/value-objects';
import { inRepository } from '../../repository';
import { enterRepository } from '../../repository/__tests__/repository.fixtures';
import { remarkRepoLinks } from '../remark-repo-links.adapter';
import { treeOf } from './mdast.fixtures';

const repository = {
  leave: (): void => undefined,
};

beforeEach(() => {
  repository.leave = enterRepository({}).leave;
});

afterEach(() => {
  repository.leave();
});

describe('remarkRepoLinks', () => {
  it('should lead the links between files to the site when the file has a path', () => {
    // Arrange
    const tree = treeOf(
      '[Plugin](../reference/plugin.md#install), [Licence](../../LICENSE.md) and [Site](https://example.com)',
    );

    // Act
    remarkRepoLinks({
      baseUrl: '/docs',
    })(
      tree,
      new VFile({
        path: inRepository(RepositoryPath.create('docs/guides/upgrade.md')),
      }),
    );

    // Assert
    expect(tree).toStrictEqual(
      treeOf(
        '[Plugin](/docs/reference/plugin#install), [Licence](https://github.com/droneey/constitution/blob/main/LICENSE.md) and [Site](https://example.com)',
      ),
    );
  });

  it('should leave the links when the file has no path', () => {
    // Arrange
    const tree = treeOf('[Plugin](../reference/plugin.md#install)');

    // Act
    remarkRepoLinks({
      baseUrl: '/docs',
    })(tree, new VFile());

    // Assert
    expect(tree).toStrictEqual(treeOf('[Plugin](../reference/plugin.md#install)'));
  });
});
