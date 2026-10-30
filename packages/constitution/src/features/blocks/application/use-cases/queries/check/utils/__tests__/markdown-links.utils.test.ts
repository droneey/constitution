import { describe, expect, it } from 'bun:test';

import { foldersOf, localLinkTargets, resolveLink } from '../markdown-links.utils';

describe('localLinkTargets', () => {
  it.each([
    {
      expected: [
        'a.md',
      ],
      name: 'an inline link with an anchor',
      text: 'See [a](a.md#part).',
    },
    {
      expected: [
        'a.md',
      ],
      name: 'a space before the closing parenthesis',
      text: 'See [a](a.md ).',
    },
    {
      expected: [
        'gone.md',
      ],
      name: 'link text holding brackets',
      text: 'See [the [draft] rule](gone.md).',
    },
    {
      expected: [
        'core.md',
      ],
      name: 'a reference definition with a title, below the paragraph that uses it',
      text: 'See [the core][core].\n\n[core]: core.md "The core"',
    },
    {
      expected: [
        'my file.md',
        'a.md',
        'c.md',
      ],
      name: 'targets in angle brackets and titles in either quotes after one space or more',
      text: 'See [a](<my file.md> "A long title"), [b](a.md \'The title\') and [c](c.md  "T").',
    },
    {
      expected: [
        'my core.md',
        'core.md',
      ],
      name: 'reference definitions with a target in angle brackets and with none after the colon',
      text: '[a]: <my core.md>\n[b]:core.md',
    },
    {
      expected: [],
      name: 'an empty target in angle brackets and a definition inside a sentence',
      text: 'See [a](<>) and the note [b]: core.md.',
    },
    {
      expected: [],
      name: 'only external links and anchors',
      text: '[a](https://a.dev) [b](HTTPS://b.dev) [c](mailto:x@y.z) [d](git+https://d.dev) [e](//e.dev) [f](#f) [g](tel:+100) [h](s3://bucket/key)',
    },
  ])('should return the local targets when the text holds $name', ({ expected, text }) => {
    // Act
    const targets = localLinkTargets(text);

    // Assert
    expect(targets).toStrictEqual(expected);
  });
});

describe('resolveLink', () => {
  it.each([
    {
      expected: '.',
      name: 'a link to the root itself',
      target: '/',
    },
  ])(
    'should resolve $name to $expected when blocks/core/core.md holds it',
    ({ expected, target }) => {
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
  it('should give the folder the paths lie in and those above it, the root among them', () => {
    // Act
    const folders = foldersOf(
      new Set([
        'a/b/c.md',
      ]),
    );

    // Assert
    expect(folders).toStrictEqual(
      new Set([
        '.',
        'a',
        'a/b',
      ]),
    );
  });
});
