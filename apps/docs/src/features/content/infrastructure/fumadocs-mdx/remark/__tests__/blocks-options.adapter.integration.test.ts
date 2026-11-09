import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { BlockLayer } from '../../../../domain/block/entities';
import { AbsolutePath } from '../../../../domain/source/value-objects';
import { enterRepository } from '../../repository/__tests__/repository.fixtures';
import { blocksOptionsOf } from '../blocks-options.adapter';

const BLOCK_FILES = {
  'blocks/core/core.md': '# Core\n\n### core-rule · MUST\n',
  'blocks/core/deep/notes.txt': '### not-markdown · MUST\n',
  'blocks/core/deep/rules.md': '### deep-rule → core-rule · SHOULD\n#### not-a-rule · MUST\n',
  'blocks/core/names.md':
    '# Names\n\n### name-says-what · MUST\n\n```md\n### fenced-rule · MUST\n```\n\n### name-is-short · MAY\n',
  'blocks/domains/ui/ui.md': '### ui-rule · MUST\n',
} as const;

const repository = {
  leave: (): void => undefined,
  root: '',
};

beforeEach(() => {
  const entered = enterRepository({
    files: {
      ...BLOCK_FILES,
      'nested/blocks/domains/people/accounts/@foundation/sign-in.md':
        '# Sign-in\n\n## Vocabulary\n\nA **session**{#session} is a sign-in.\n\n### session-expires · MUST\n\n### session-renewed · MAY\n',
      'nested/blocks/domains/people/accounts/accounts.md': '# Accounts\n',
    },
  });

  repository.leave = entered.leave;
  repository.root = entered.root;
});

afterEach(() => {
  repository.leave();
});

describe('blocksOptionsOf', () => {
  it('should address every rule of the folders the site renders but a heading of MAY', () => {
    // Arrange
    const input = {
      baseUrl: '/docs',
      blocksFolderPath: AbsolutePath.create(join(repository.root, 'blocks')),
      layers: [
        BlockLayer.Core,
      ],
    };

    // Act
    const options = blocksOptionsOf(input);

    // Assert
    expect(options).toStrictEqual({
      addressesBySlug: new Map([
        [
          'core-rule',
          '/docs/core#core-rule',
        ],
        [
          'deep-rule',
          '/docs/core/deep/rules#deep-rule',
        ],
        [
          'name-says-what',
          '/docs/core/names#name-says-what',
        ],
      ]),
    });
  });

  it("should address the rules of a nested block at their pages' addresses, and no heading of MAY", () => {
    // Arrange
    const input = {
      baseUrl: '/docs',
      blocksFolderPath: AbsolutePath.create(join(repository.root, 'nested/blocks')),
      layers: [
        BlockLayer.Domain,
      ],
    };

    // Act
    const options = blocksOptionsOf(input);

    // Assert
    expect(options).toStrictEqual({
      addressesBySlug: new Map([
        [
          'session-expires',
          '/docs/domains/people/accounts/foundation/sign-in#session-expires',
        ],
      ]),
    });
  });
});
