import { describe, expect, it } from 'bun:test';

import { foldersOf, linkTargetsOf, resolveLink } from '../link-targets.utils';

describe('linkTargetsOf', () => {
  it('should skip the links inside fenced and inline code when the text holds both', () => {
    // Arrange
    const text = [
      'See [a](a.md).',
      '```ts',
      'handlers[event.type](event);',
      '```',
      'Call `listeners[name](payload)` too.',
    ].join('\n');

    // Act
    const targets = linkTargetsOf(text);

    // Assert
    expect(targets).toStrictEqual([
      'a.md',
    ]);
  });
});

describe('resolveLink', () => {
  it.each([
    [
      'principles.md',
      'blocks/core/principles.md',
    ],
    [
      '../domains/ui/ui.md',
      'blocks/domains/ui/ui.md',
    ],
    [
      '/README.md',
      'README.md',
    ],
    [
      '../core/',
      'blocks/core',
    ],
    [
      '../../',
      '.',
    ],
  ])(
    'should resolve %p to %p when blocks/core/core.md links it',
    (target, expected) => {
      // Arrange
      const link = {
        path: 'blocks/core/core.md',
        target,
      };

      // Act
      const resolved = resolveLink(link);

      // Assert
      expect(resolved).toBe(expected);
    },
  );
});

describe('foldersOf', () => {
  it('should list the root and every folder that holds a file when paths nest', () => {
    // Arrange
    const paths = new Set([
      'README.md',
      'blocks/core/core.md',
    ]);

    // Act
    const folders = foldersOf(paths);

    // Assert
    expect([
      ...folders,
    ]).toStrictEqual([
      '.',
      'blocks',
      'blocks/core',
    ]);
  });
});
