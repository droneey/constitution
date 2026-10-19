import { afterEach, describe, expect, it } from 'bun:test';

import { documentIconOf, guideIconOf, sectionSummaryOf, sidebarOf } from '../navigation.adapter';
import { inRepository } from '../repository.adapter';
import { enterRepository } from './repository.fixtures';

const MARK = '<img src=".brand/diamond.svg" width="18" height="18" alt="">';

const README = [
  '<p align="center"><img src=".brand/banner-light.svg" alt="Constitution"></p>',
  '',
  'The Constitution is one set of rules.',
  '',
  `## ${MARK} Quick start`,
  '',
  '> Install the plugin, pin a release, **ratify** a project.',
  '>',
  '> Then start.',
  '',
  '- [Not an entry](docs/quick.md)',
  '',
  `## ${MARK} Documentation`,
  '',
  '- [Before any group](docs/before.md)',
  '',
  '### Start',
  '',
  '- [How it works](docs/how-it-works.md) — the layers and the axes',
  '- [Core](packages/constitution/blocks/core/core.md)',
  '- [Glossary](PROJECT.md#glossary) — the words the rules use',
  '',
  '### Reference',
  '',
  '- [Precedence](packages/constitution/blocks/core/core.md#precedence) — which rule wins',
  '- [Placement](packages/constitution/blocks/core/foundation/placement.md) — where a rule goes',
  '- [Names](packages/constitution/blocks/core/names.md)',
  '- [Blocks](packages/constitution/blocks/domains) — every block, on GitHub',
  '- [Site](https://example.com/site) — not a file of the repository',
  '- An entry without a link',
  '- **[Strong](docs/strong.md)** — a link inside emphasis',
  '-',
  '',
  `## ${MARK} Licence`,
  '',
  '- [Licence](LICENSE.md)',
].join('\n');

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('sidebarOf', () => {
  it('should list the pages of the Documentation section in their groups', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': README,
      },
      folders: [
        'packages/constitution/blocks/domains',
      ],
    }).leave;

    // Act
    const { pages } = sidebarOf('/docs');

    // Assert
    expect(pages).toStrictEqual([
      '---Start---',
      'index',
      'quick-start',
      './how-it-works',
      'core',
      './glossary',
      '---Reference---',
      '[Layers][Precedence](/docs/core#precedence)',
      '[MapPin][Placement](/docs/core/foundation/placement)',
      '[Names](/docs/core/names)',
      'domains',
    ]);
  });

  it('should describe each entry by its note when the README gives one', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': README,
      },
      folders: [
        'packages/constitution/blocks/domains',
      ],
    }).leave;

    // Act
    const { descriptions } = sidebarOf('/docs');

    // Assert
    expect([
      ...descriptions,
    ]).toStrictEqual([
      [
        'how-it-works',
        'The layers and the axes.',
      ],
      [
        'core',
        '',
      ],
      [
        'glossary',
        'The words the rules use.',
      ],
      [
        '/core#precedence',
        'Which rule wins.',
      ],
      [
        'core/foundation/placement',
        'Where a rule goes.',
      ],
      [
        'core/names',
        '',
      ],
      [
        'https://github.com/droneey/constitution/tree/main/packages/constitution/blocks/domains',
        'Every block, on GitHub.',
      ],
    ]);
  });

  it('should list the last group when the Documentation section ends the README', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': '## Documentation\n\n### Guides\n\n- [Upgrade](docs/guides/upgrade.md)',
      },
    }).leave;

    // Act
    const { pages } = sidebarOf('/site');

    // Assert
    expect(pages).toStrictEqual([
      '---Guides---',
      'index',
      'quick-start',
      './guides/upgrade',
    ]);
  });

  it('should fail when the README has no Documentation section', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': '# The Constitution\n\n### Documentation\n\n- [Upgrade](docs/upgrade.md)',
      },
    }).leave;

    // Act
    const read = (): unknown => sidebarOf('/docs');

    // Assert
    expect(read).toThrow(new Error('README.md has no section Documentation'));
  });
});

describe('sectionSummaryOf', () => {
  it('should read the first paragraph of the quote under the heading as plain text', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': README,
      },
    }).leave;

    // Act
    const summary = sectionSummaryOf('Quick start');

    // Assert
    expect(summary).toBe('Install the plugin, pin a release, ratify a project.');
  });

  it.each([
    {
      condition: 'the README has no such section and opens with a quote',
      readme: '> A quote first.\n\n## Licence\n\nFree.',
    },
    {
      condition: 'no quote follows the heading',
      readme: '## Quick start\n\nInstall it.\n\n> Later.',
    },
    {
      condition: 'the quote is empty',
      readme: '## Quick start\n\n>\n\nInstall it.',
    },
    {
      condition: 'the quote opens with a heading',
      readme: '## Quick start\n\n> ## Install\n>\n> Then.',
    },
  ])('should read no summary when $condition', ({ readme }) => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'README.md': readme,
      },
    }).leave;

    // Act
    const summary = sectionSummaryOf('Quick start');

    // Assert
    expect(summary).toBeUndefined();
  });
});

describe('guideIconOf', () => {
  it.each([
    {
      condition: 'the guide has an icon',
      icon: 'CircleArrowUp',
      path: 'docs/guides/upgrade.md',
    },
    {
      condition: 'the guide has none',
      icon: undefined,
      path: 'docs/guides/notes.md',
    },
  ])('should give the icon when $condition', ({ icon, path }) => {
    // Arrange
    repository.leave = enterRepository({}).leave;

    // Act
    const found = guideIconOf(inRepository(path));

    // Assert
    expect(found).toBe(icon);
  });
});

describe('documentIconOf', () => {
  it.each([
    {
      condition: 'the document has an icon',
      icon: 'Scale',
      path: '/repository/DECISIONS.md',
    },
    {
      condition: 'the document has none',
      icon: undefined,
      path: '/repository/CONTRIBUTING.md',
    },
    {
      condition: 'the site does not render the document',
      icon: undefined,
      path: '/repository/README.md',
    },
  ])('should give the icon when $condition', ({ icon, path }) => {
    // Arrange
    const file = path;

    // Act
    const found = documentIconOf(file);

    // Assert
    expect(found).toBe(icon);
  });
});
