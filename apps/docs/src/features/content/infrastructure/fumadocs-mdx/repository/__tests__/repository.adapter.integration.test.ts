import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { RepositoryPath } from '../../../../domain/source/value-objects';
import { addressOf, blockLayerOf, inRepository, linkTargetOf } from '../repository.adapter';
import { enterRepository } from './repository.fixtures';

const GITHUB = 'https://github.com/droneey/constitution';

const repository = {
  leave: (): void => undefined,
};

beforeEach(() => {
  repository.leave = enterRepository({
    files: {
      'LICENSE.md': 'Licence.',
      'packages/constitution/blocks/core/core.md': '# Core',
    },
    folders: [
      'packages/constitution/blocks/domains',
    ],
  }).leave;
});

afterEach(() => {
  repository.leave();
});

describe('addressOf', () => {
  it.each([
    {
      address: '/docs',
      condition: 'the link leads to the README',
      hash: '',
      path: 'README.md',
    },
    {
      address: '/docs/quick-start',
      condition: 'the link leads to the quick start of the README',
      hash: 'quick-start',
      path: 'README.md',
    },
    {
      address: '/docs/quick-start',
      condition:
        "the link leads to the quick start by GitHub's anchor, which keeps the heading's mark as a hyphen",
      hash: '-quick-start',
      path: 'README.md',
    },
    {
      address: '/docs#documentation',
      condition: 'the link leads to another section of the README',
      hash: 'documentation',
      path: 'README.md',
    },
    {
      address: '/docs#documentation',
      condition: "the link leads to another section of the README by GitHub's anchor",
      hash: '-documentation',
      path: 'README.md',
    },
    {
      address: '/docs#a-b',
      condition: 'the anchor of a section of the README holds a hyphen of its own',
      hash: 'a-b',
      path: 'README.md',
    },
    {
      address: '/docs/guides/upgrade',
      condition: 'the link leads to a guide',
      hash: '',
      path: 'docs/guides/upgrade.md',
    },
    {
      address: '/docs/guides/upgrade#steps',
      condition: 'the link leads to a section of a guide',
      hash: 'steps',
      path: 'docs/guides/upgrade.md',
    },
    {
      address: `${GITHUB}/blob/main/docs/notes.txt`,
      condition: 'the link leads to a file of the guides that is not Markdown',
      hash: '',
      path: 'docs/notes.txt',
    },
    {
      address: `${GITHUB}/blob/main/notes/docs/guide.md`,
      condition: 'the link leads to a guide of another folder',
      hash: '',
      path: 'notes/docs/guide.md',
    },
    {
      address: '/docs/glossary',
      condition: 'the link leads to the glossary of the project',
      hash: 'glossary',
      path: 'PROJECT.md',
    },
    {
      address: `${GITHUB}/blob/main/PROJECT.md#entities`,
      condition: 'the link leads to another section of the project',
      hash: 'entities',
      path: 'PROJECT.md',
    },
    {
      address: `${GITHUB}/blob/main/LICENSE.md#glossary`,
      condition: 'the link leads to a section named glossary in another file',
      hash: 'glossary',
      path: 'LICENSE.md',
    },
    {
      address: '/docs/contributing',
      condition: 'the link leads to a document the site renders',
      hash: '',
      path: 'CONTRIBUTING.md',
    },
    {
      address: '/docs/decisions#adr-0001',
      condition: 'the link leads to a section of a document the site renders',
      hash: 'adr-0001',
      path: 'DECISIONS.md',
    },
    {
      address: '/docs/core',
      condition: 'the link leads to the card of a block the site renders',
      hash: '',
      path: 'packages/constitution/blocks/core/core.md',
    },
    {
      address: '/docs/core/names#name-says-what',
      condition: 'the link leads to a rule of a chapter the site renders',
      hash: 'name-says-what',
      path: 'packages/constitution/blocks/core/names.md',
    },
    {
      address: '/docs/domains/ui#rule',
      condition: "the link leads to a rule of a domain's card",
      hash: 'rule',
      path: 'packages/constitution/blocks/domains/ui/ui.md',
    },
    {
      address: '/docs/contexts/platforms/browser/with/ui',
      condition: "the link leads to a platform's seam, inside contexts",
      hash: '',
      path: 'packages/constitution/blocks/contexts/platforms/browser/with/ui.md',
    },
    {
      address: `${GITHUB}/blob/main/packages/constitution/blocks/core/core.txt`,
      condition: 'the link leads to a file of a rendered block that is not Markdown',
      hash: '',
      path: 'packages/constitution/blocks/core/core.txt',
    },
    {
      address: `${GITHUB}/blob/main/packs/constitution/blocks/core/core.md`,
      condition: 'the link leads to blocks outside the Constitution',
      hash: '',
      path: 'packs/constitution/blocks/core/core.md',
    },
    {
      address: `${GITHUB}/tree/main/packages/constitution/blocks/domains`,
      condition: 'the link leads to a folder',
      hash: '',
      path: 'packages/constitution/blocks/domains',
    },
    {
      address: `${GITHUB}/blob/main/LICENSE.md#terms`,
      condition: 'the link leads to a file the site does not render',
      hash: 'terms',
      path: 'LICENSE.md',
    },
    {
      address: `${GITHUB}/blob/main/MISSING.md`,
      condition: 'the link leads to no file',
      hash: '',
      path: 'MISSING.md',
    },
  ])('should give the address when $condition', ({ address, hash, path }) => {
    // Arrange
    const baseUrl = '/docs';
    const repositoryPath = RepositoryPath.create(path);

    // Act
    const found = addressOf(baseUrl, repositoryPath, hash);

    // Assert
    expect(found).toBe(address);
  });
});

describe('linkTargetOf', () => {
  it.each([
    {
      condition: 'a guide links to a sibling',
      from: 'docs/guides/upgrade.md',
      target: {
        hash: '',
        path: 'docs/guides/write-a-pack.md',
      },
      url: 'write-a-pack.md',
    },
    {
      condition: 'a guide links to a section of a file above it',
      from: 'docs/guides/upgrade.md',
      target: {
        hash: 'install',
        path: 'docs/reference/plugin.md',
      },
      url: '../reference/plugin.md#install',
    },
    {
      condition: 'a file links to a section of its own',
      from: 'docs/guides/upgrade.md',
      target: {
        hash: 'steps',
        path: 'docs/guides/upgrade.md',
      },
      url: '#steps',
    },
    {
      condition: 'a guide links to a folder',
      from: 'docs/guides/upgrade.md',
      target: {
        hash: '',
        path: 'docs/guides',
      },
      url: './',
    },
    {
      condition: 'a folder holds a colon in its name',
      from: 'README.md',
      target: {
        hash: '',
        path: 'docs/a:b.md',
      },
      url: 'docs/a:b.md',
    },
  ])('should read the path when $condition', ({ from, target, url }) => {
    // Arrange
    const fromFilePath = inRepository(RepositoryPath.create(from));
    const expected = {
      hash: target.hash,
      path: RepositoryPath.create(target.path),
    };

    // Act
    const found = linkTargetOf(fromFilePath, url);

    // Assert
    expect(found).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'the link has a scheme',
      url: 'https://example.com/docs',
    },
    {
      condition: 'the link has a scheme in capitals',
      url: 'MAILTO:someone@example.com',
    },
    {
      condition: 'the link is absolute',
      url: '/docs/core',
    },
    {
      condition: 'the link leaves the repository',
      url: '../outside.md',
    },
  ])('should read no path when $condition', ({ url }) => {
    // Arrange
    const fromFilePath = inRepository(RepositoryPath.create('README.md'));

    // Act
    const found = linkTargetOf(fromFilePath, url);

    // Assert
    expect(found).toBeUndefined();
  });
});

describe('blockLayerOf', () => {
  it.each([
    {
      folder: 'core',
      path: 'packages/constitution/blocks/core',
    },
    {
      folder: 'domains',
      path: 'packages/constitution/blocks/domains',
    },
    {
      folder: 'contexts',
      path: 'packages/constitution/blocks/contexts',
    },
    {
      folder: 'implementations',
      path: 'packages/constitution/blocks/implementations',
    },
    {
      folder: undefined,
      path: 'packages/constitution/blocks/contexts/platforms',
    },
  ])('should give $folder as the sidebar folder of $path', ({ folder, path }) => {
    // Arrange
    const repositoryPath = RepositoryPath.create(path);

    // Act
    const layer = blockLayerOf(repositoryPath);

    // Assert
    expect(layer).toBe(folder);
  });
});
