import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { addressOf, inRepository, repositoryPathOf } from '../repository.adapter';
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
      address: `${GITHUB}/blob/main/packages/constitution/blocks/domains/ui/ui.md#rule`,
      condition: 'the link leads to a block the site does not render',
      hash: 'rule',
      path: 'packages/constitution/blocks/domains/ui/ui.md',
    },
    {
      address: `${GITHUB}/blob/main/packages/constitution/blocks/corex/corex.md`,
      condition: 'the link leads to a block whose name starts like a rendered one',
      hash: '',
      path: 'packages/constitution/blocks/corex/corex.md',
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

    // Act
    const found = addressOf(baseUrl, path, hash);

    // Assert
    expect(found).toBe(address);
  });
});

describe('repositoryPathOf', () => {
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
    const file = inRepository(from);

    // Act
    const found = repositoryPathOf(file, url);

    // Assert
    expect(found).toStrictEqual(target);
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
    const file = inRepository('README.md');

    // Act
    const found = repositoryPathOf(file, url);

    // Assert
    expect(found).toBeUndefined();
  });
});
