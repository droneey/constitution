import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { BlockLayer } from '../../../../domain/entities';
import { SourceFailure } from '../../../../domain/errors';
import { AbsolutePath } from '../../../../domain/value-objects';
import { enterRepository, failureOf } from '../../repository/__tests__/repository.fixtures';
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
      'examples/core-rule.md': '```ts title="Avoid"\nlet a;\n```\n',
      'examples/notes.txt': 'no example',
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
