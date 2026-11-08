import { afterEach, describe, expect, it } from 'bun:test';

import { BlockLayer } from '../../../../domain/block/entities';
import { SourceFailure } from '../../../../domain/source/errors';
import {
  axisFoldersOf,
  childBlocksOf,
  coreChaptersOf,
  layerBlocksOf,
  seamHoldersOf,
} from '../blocks.adapter';
import { enterRepository, failureOf } from './repository.fixtures';

const CORE = 'packages/constitution/blocks/core';

const passportText = [
  '# Core',
  '',
  'Prose may quote - `foundation/`: [code](foundation/code.md) mid-line.',
  '',
  '- `PROJECT.md`: [code](foundation/code.md).',
  '',
  '## Its chapters',
  '',
  '- `foundation/`: [placement](foundation/placement.md), [code](foundation/code.md).',
  '- `architecture/`: [layers](architecture/layers.md).',
  '',
].join('\n');

const CORE_FILES = {
  [`${CORE}/architecture/layers.md`]: '# Layers\n',
  [`${CORE}/foundation/code.md`]: '# Code\n',
  [`${CORE}/foundation/placement.md`]: '# Placement\n',
} as const;

const cardOf = (id: string, base: string): string =>
  `---\nid: ${id}\nextends: ${base}\n---\n\n# ${id}\n`;

const DOMAINS = 'packages/constitution/blocks/domains';

const NESTED_DOMAINS = {
  [`${DOMAINS}/people/people.md`]: '---\nid: people\n---\n\n# People\n',
  [`${DOMAINS}/people/@workflow/reviews.md`]: '# Reviews\n',
  [`${DOMAINS}/people/accounts/admins/admins.md`]: '---\nid: people/accounts/admins\n---\n',
  [`${DOMAINS}/people/@foundation/with/client/browser.md`]: '# Browser\n',
  [`${DOMAINS}/people/accounts/accounts.md`]: '---\nid: people/accounts\n---\n',
  [`${DOMAINS}/people/accounts/@architecture/sessions.md`]: '# Sessions\n',
  [`${DOMAINS}/ai/ai.md`]: '---\nid: ai\n---\n',
  [`${DOMAINS}/people/@foundation/consent.md`]: '# Consent\n',
  [`${DOMAINS}/contracts/contracts.md`]: '---\nid: contracts\n---\n',
} as const;

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('coreChaptersOf', () => {
  it("should give core's chapters in the order its passport lists them", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        ...CORE_FILES,
        [`${CORE}/core.md`]: passportText,
      },
    }).leave;

    // Act
    const chapters = coreChaptersOf();

    // Assert
    expect(chapters).toStrictEqual([
      'foundation/placement',
      'foundation/code',
      'architecture/layers',
    ]);
  });

  it('should read the chapters of a nested core, whose axis folders are marked', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        [`${CORE}/@foundation/code.md`]: '# Code\n',
        [`${CORE}/@workflow/changes.md`]: '# Changes\n',
        [`${CORE}/core.md`]:
          '# Core\n\n## Its chapters\n\n- `@foundation/`: [code](@foundation/code.md).\n- `@workflow/`: [changes](@workflow/changes.md).\n',
      },
    }).leave;

    // Act
    const chapters = coreChaptersOf();

    // Assert
    expect(chapters).toStrictEqual([
      '@foundation/code',
      '@workflow/changes',
    ]);
  });

  it.each([
    {
      condition: 'leaves a chapter out',
      extra: {
        [`${CORE}/foundation/names.md`]: '# Names\n',
      },
      gaps: {
        missing: [
          'foundation/names',
        ],
        repeated: [],
        unknown: [],
      },
      passport: passportText,
    },
    {
      condition: 'lists a chapter core does not have',
      extra: {},
      gaps: {
        missing: [],
        repeated: [],
        unknown: [
          'foundation/types',
        ],
      },
      passport: `${passportText}- \`foundation/\`: [types](foundation/types.md)\n`,
    },
  ])(
    'should stop the build, naming the gap, when the passport $condition',
    ({ extra, gaps, passport }) => {
      // Arrange
      repository.leave = enterRepository({
        files: {
          ...CORE_FILES,
          ...extra,
          [`${CORE}/core.md`]: passport,
        },
      }).leave;

      // Act
      const failure = failureOf(coreChaptersOf);

      // Assert
      expect(failure).toStrictEqual({
        cause: undefined,
        code: SourceFailure.ChapterListMismatch,
        details: gaps,
      });
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
    const blocks = layerBlocksOf(BlockLayer.Domain);

    // Assert
    expect(blocks).toStrictEqual([
      'access-control',
      '_api',
      'admin-api',
      'rest-api',
      'ui',
    ]);
  });

  it("should list a nested layer by the names of the blocks no other block's folder holds, reading no base", () => {
    // Arrange
    repository.leave = enterRepository({
      files: NESTED_DOMAINS,
    }).leave;

    // Act
    const blocks = layerBlocksOf(BlockLayer.Domain);

    // Assert
    expect(blocks).toStrictEqual([
      'ai',
      'contracts',
      'people',
    ]);
  });

  it("should stop the build, naming the passport, when a card's base is no block's id", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/blocks/domains/ui/ui.md': cardOf('ui', '3'),
      },
    }).leave;

    // Act
    const failure = failureOf(() => layerBlocksOf(BlockLayer.Domain));

    // Assert
    expect(failure).toStrictEqual({
      cause: 'ZodError',
      code: SourceFailure.FileMalformed,
      details: {
        path: 'domains/ui/ui.md',
      },
    });
  });
});

describe('axisFoldersOf', () => {
  it("should give each axis folder of a layer's blocks", () => {
    // Arrange
    const domains = 'packages/constitution/blocks/domains';

    repository.leave = enterRepository({
      files: {
        [`${domains}/i18n/i18n.md`]: cardOf('i18n', 'null'),
        [`${domains}/ui/architecture/state.md`]: '# State\n',
        [`${domains}/ui/ui.md`]: cardOf('ui', 'null'),
        [`${domains}/ui/workflow/reviews.md`]: '# Reviews\n',
      },
    }).leave;

    // Act
    const folders = axisFoldersOf(BlockLayer.Domain);

    // Assert
    expect(folders).toStrictEqual([
      'domains/ui/architecture',
      'domains/ui/workflow',
    ]);
  });
});

describe('axisFoldersOf in the nested format', () => {
  it("should give each axis folder of a layer's blocks and of the blocks they hold, in the axes' order", () => {
    // Arrange
    repository.leave = enterRepository({
      files: NESTED_DOMAINS,
    }).leave;

    // Act
    const folders = axisFoldersOf(BlockLayer.Domain);

    // Assert
    expect(folders).toStrictEqual([
      'domains/people/@foundation',
      'domains/people/@workflow',
      'domains/people/accounts/@architecture',
    ]);
  });
});

describe('childBlocksOf', () => {
  it("should give each block of a layer that sits in another block's folder", () => {
    // Arrange
    repository.leave = enterRepository({
      files: NESTED_DOMAINS,
    }).leave;

    // Act
    const children = childBlocksOf(BlockLayer.Domain);

    // Assert
    expect(children).toStrictEqual([
      'domains/people/accounts',
      'domains/people/accounts/admins',
    ]);
  });
});

describe('seamHoldersOf', () => {
  it("should give each axis folder of a layer's blocks that holds seams", () => {
    // Arrange
    const domains = 'packages/constitution/blocks/domains';

    repository.leave = enterRepository({
      files: {
        [`${domains}/i18n/i18n.md`]: cardOf('i18n', 'null'),
        [`${domains}/ui/architecture/with/remote-data.md`]: '# Remote data\n',
        [`${domains}/ui/ui.md`]: cardOf('ui', 'null'),
        [`${domains}/ui/foundation/screens.md`]: '# Screens\n',
        [`${domains}/ui/workflow/with/i18n.md`]: '# i18n\n',
      },
    }).leave;

    // Act
    const folders = seamHoldersOf(BlockLayer.Domain);

    // Assert
    expect(folders).toStrictEqual([
      'domains/ui/architecture',
      'domains/ui/workflow',
    ]);
  });

  it('should give each nested axis folder that holds seams, whatever folders its seams sit in', () => {
    // Arrange
    repository.leave = enterRepository({
      files: NESTED_DOMAINS,
    }).leave;

    // Act
    const folders = seamHoldersOf(BlockLayer.Domain);

    // Assert
    expect(folders).toStrictEqual([
      'domains/people/@foundation',
    ]);
  });
});
