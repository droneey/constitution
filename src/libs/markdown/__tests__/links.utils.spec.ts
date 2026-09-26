import { describe, expect, it } from 'bun:test';

import { localLinkTargets, rewriteLocalLinks } from '../links.utils';

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
      expected: [],
      name: 'only external links and anchors',
      text: '[a](https://a.dev) [b](HTTPS://b.dev) [c](mailto:x@y.z) [d](git+https://d.dev) [e](//e.dev) [f](#f) [g](tel:+100) [h](s3://bucket/key)',
    },
  ])(
    'should return the local targets when the text holds $name',
    ({ expected, text }) => {
      // Arrange
      const input = text;

      // Act
      const targets = localLinkTargets(input);

      // Assert
      expect(targets).toStrictEqual(expected);
    },
  );
});

describe('rewriteLocalLinks', () => {
  it.each([
    {
      expected: 'See [a](root/a.md#part).',
      name: 'a link with an anchor',
      text: 'See [a](a.md#part).',
    },
    {
      expected: 'See [t](<root/my file.md>).',
      name: 'an angle-bracket target holding a space',
      text: 'See [t](<my file.md>).',
    },
    {
      expected: 'See [t](root/a.md  "Title").',
      name: 'a link with two spaces before its title',
      text: 'See [t](a.md  "Title").',
    },
    {
      expected: "See [t](root/a.md 'Title').",
      name: 'a link with a single-quoted title',
      text: "See [t](a.md 'Title').",
    },
    {
      expected: '[x]: <root/my file.md>',
      name: 'a reference definition in angle brackets',
      text: '[x]: <my file.md>',
    },
    {
      expected: '   [x]: root/a.md',
      name: 'a reference definition indented by three spaces',
      text: '   [x]: a.md',
    },
    {
      expected: '[x]:root/a.md',
      name: 'a reference definition with no space after its colon',
      text: '[x]:a.md',
    },
    {
      expected: '    [x]: a.md',
      name: 'a line indented by four spaces, which is no definition',
      text: '    [x]: a.md',
    },
    {
      expected: '[a](root/a.md) and [b](root/b.md)',
      name: 'two links on one line',
      text: '[a](a.md) and [b](b.md)',
    },
    {
      expected: '![logo](root/logo.png)',
      name: 'an image',
      text: '![logo](logo.png)',
    },
    {
      expected: '[a](https://a.dev) [c](mailto:x@y.z) [e](//e.dev) [f](#f)',
      name: 'only external links and anchors',
      text: '[a](https://a.dev) [c](mailto:x@y.z) [e](//e.dev) [f](#f)',
    },
    {
      expected: '[a](<>)',
      name: 'an empty angle-bracket target',
      text: '[a](<>)',
    },
    {
      expected: '```md\n[a](a.md)\n\n[b](b.md)\n```\nSee [c](root/c.md).',
      name: 'links in a fenced code block of two paragraphs, then one after it',
      text: '```md\n[a](a.md)\n\n[b](b.md)\n```\nSee [c](c.md).',
    },
    {
      expected: 'Write `see\n[a](a.md)` in the text.',
      name: 'a link inside a code span that wraps a line',
      text: 'Write `see\n[a](a.md)` in the text.',
    },
    {
      expected: 'See [`a]`](root/a.md).',
      name: 'link text holding a bracket in a code span',
      text: 'See [`a]`](a.md).',
    },
  ])(
    'should rewrite each local target and keep the rest as written when the text holds $name',
    ({ expected, text }) => {
      // Arrange
      const input = {
        rewrite: (target: string): string => `root/${target}`,
        text,
      };

      // Act
      const rewritten = rewriteLocalLinks(input);

      // Assert
      expect(rewritten).toBe(expected);
    },
  );
});
