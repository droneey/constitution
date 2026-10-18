import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { enterRepository } from '../../repository/__tests__/repository.fixtures';
import { blocksOptionsOf } from '../blocks-options.adapter';

const BLOCKS = {
  'blocks/core/core.md': '# Core\n\n### core-rule · MUST\n',
  'blocks/core/deep/notes.txt': '### not-markdown · MUST\n',
  'blocks/core/deep/rules.md': '### deep-rule → core-rule · SHOULD\n#### not-a-rule · MUST\n',
  'blocks/core/names.md': '# Names\n\n### name-says-what · MUST\n\n### name-is-short · MAY\n',
  'blocks/domains/ui/ui.md': '### ui-rule · MUST\n',
};

const repository = {
  leave: (): void => undefined,
  root: '',
};

beforeEach(() => {
  const entered = enterRepository({
    files: {
      ...BLOCKS,
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
      blocks: join(repository.root, 'blocks'),
      examples: join(repository.root, 'examples'),
      folders: [
        'core',
      ],
    };

    // Act
    const options = blocksOptionsOf(input);

    // Assert
    expect(options).toStrictEqual({
      addresses: new Map([
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
      examples: new Map([
        [
          'core-rule',
          '```ts title="Avoid"\nlet a;\n```\n',
        ],
      ]),
    });
  });

  it('should fail when an example names no rule of the folders', () => {
    // Arrange
    const input = {
      baseUrl: '/docs',
      blocks: join(repository.root, 'blocks'),
      examples: join(repository.root, 'examples'),
      folders: [
        'domains',
      ],
    };

    // Act
    const read = (): unknown => blocksOptionsOf(input);

    // Assert
    expect(read).toThrow(new Error('examples name no rule: core-rule'));
  });
});
