import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { BlockFormat, BlockLayer } from '../../../../domain/block/entities';
import { SourceFailure } from '../../../../domain/source/errors';
import { AbsolutePath } from '../../../../domain/source/value-objects';
import { enterRepository, failureOf } from '../../repository/__tests__/repository.fixtures';
import { blocksOptionsOf } from '../blocks-options.adapter';
import { LEVEL_LETTERS_BY_FORMAT } from '../remark-blocks.constants';

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
      'examples/core-rule.md': '```ts title="Avoid"\nlet a;\n```\n',
      'examples/notes.txt': 'no example',
      'nested/blocks/domains/people/accounts/@foundation/sign-in.md':
        '# Sign-in\n\n## Vocabulary\n\nA **session**{#session} is a sign-in.\n\n### session-expires · MUST\n\n### session-renewed · MAY\n',
      'nested/blocks/domains/people/accounts/accounts.md': '# Accounts\n',
      'nested/examples/session-expires.md': '```ts title="Prefer"\nexpire();\n```\n',
    },
  });

  repository.leave = entered.leave;
  repository.root = entered.root;
});

afterEach(() => {
  repository.leave();
});

describe('blocksOptionsOf', () => {
  it('should address every rule of the folders the site renders, with the examples', () => {
    // Arrange
    const input = {
      baseUrl: '/docs',
      blocksFolderPath: AbsolutePath.create(join(repository.root, 'blocks')),
      examplesFolderPath: AbsolutePath.create(join(repository.root, 'examples')),
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
        [
          'name-is-short',
          '/docs/core/names#name-is-short',
        ],
      ]),
      examplesBySlug: new Map([
        [
          'core-rule',
          '```ts title="Avoid"\nlet a;\n```\n',
        ],
      ]),
      levelLetters: LEVEL_LETTERS_BY_FORMAT[BlockFormat.Legacy],
    });
  });

  it("should address the rules of a nested tree at their pages' addresses, by the levels its headings state", () => {
    // Arrange
    const input = {
      baseUrl: '/docs',
      blocksFolderPath: AbsolutePath.create(join(repository.root, 'nested/blocks')),
      examplesFolderPath: AbsolutePath.create(join(repository.root, 'nested/examples')),
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
      examplesBySlug: new Map([
        [
          'session-expires',
          '```ts title="Prefer"\nexpire();\n```\n',
        ],
      ]),
      levelLetters: LEVEL_LETTERS_BY_FORMAT[BlockFormat.Nested],
    });
  });

  it('should fail, naming each example that names no rule of the folders', () => {
    // Arrange
    writeFileSync(
      join(repository.root, 'examples/ui-only.md'),
      '```ts title="Prefer"\nconst a = 1;\n```\n',
    );

    const input = {
      baseUrl: '/docs',
      blocksFolderPath: AbsolutePath.create(join(repository.root, 'blocks')),
      examplesFolderPath: AbsolutePath.create(join(repository.root, 'examples')),
      layers: [
        BlockLayer.Domain,
      ],
    };

    // Act
    const failure = failureOf(() => blocksOptionsOf(input));

    // Assert
    expect(failure).toStrictEqual({
      cause: undefined,
      code: SourceFailure.ExampleRuleUnknown,
      details: {
        slugs: [
          'core-rule',
          'ui-only',
        ],
      },
    });
  });
});
