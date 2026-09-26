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
        'gone.md',
      ],
      name: 'a link with a title',
      text: 'See [t](gone.md "Title").',
    },
    {
      expected: [
        'gone 4.md',
      ],
      name: 'a link in angle brackets',
      text: 'See [t](<gone 4.md>).',
    },
    {
      expected: [
        'gone.md',
      ],
      name: 'a reference definition',
      text: 'See [r][x].\n\n[x]: gone.md',
    },
    {
      expected: [
        'gone 4.md',
      ],
      name: 'a reference definition in angle brackets',
      text: 'See [r][x].\n\n[x]: <gone 4.md>',
    },
    {
      expected: [
        'gone.md',
      ],
      name: 'link text holding brackets',
      text: 'See [a [b]](gone.md).',
    },
    {
      expected: [
        'logo.png',
      ],
      name: 'an image',
      text: '![logo](logo.png)',
    },
    {
      expected: [],
      name: 'only external links and anchors',
      text: '[a](https://a.dev) [b](HTTPS://b.dev) [c](mailto:x@y.z) [d](git+https://d.dev) [e](//e.dev) [f](#f) [g](tel:+100)',
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
      expected: 'See [a](root/a.md).',
      name: 'a bare relative link',
      text: 'See [a](a.md).',
    },
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
      expected: 'See [t](root/a.md "Title").',
      name: 'a link with a title',
      text: 'See [t](a.md "Title").',
    },
    {
      expected: '[x]: root/a.md',
      name: 'a reference definition',
      text: '[x]: a.md',
    },
    {
      expected: '[x]: root/a.md "Title"',
      name: 'a reference definition with a title',
      text: '[x]: a.md "Title"',
    },
    {
      expected: '[x]: <root/my file.md>',
      name: 'a reference definition in angle brackets',
      text: '[x]: <my file.md>',
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
      expected: '[a](root/a.md)\n```md\n[b](b.md)\n```\n[c](root/c.md)',
      name: 'a link in a fenced code block',
      text: '[a](a.md)\n```md\n[b](b.md)\n```\n[c](c.md)',
    },
    {
      expected: 'Write `[a](a.md)`; see [b](root/b.md).',
      name: 'a link inside an inline code span',
      text: 'Write `[a](a.md)`; see [b](b.md).',
    },
    {
      expected: 'Write `see\n[a](a.md)` in the text.',
      name: 'a link inside a code span that wraps a line',
      text: 'Write `see\n[a](a.md)` in the text.',
    },
    {
      expected: 'Call `a\nb` then [x](root/x.md) and `c`.',
      name: 'a link after a code span that wraps a line',
      text: 'Call `a\nb` then [x](x.md) and `c`.',
    },
    {
      expected: 'See [`a`](root/a.md).',
      name: 'link text holding a code span',
      text: 'See [`a`](a.md).',
    },
    {
      expected: 'See [`a]`](root/a.md).',
      name: 'link text holding a bracket in a code span',
      text: 'See [`a]`](a.md).',
    },
    {
      expected: '[a](<>)',
      name: 'an empty angle-bracket target',
      text: '[a](<>)',
    },
    {
      expected: "See [t](root/a.md 'Title').",
      name: 'a link with a single-quoted title',
      text: "See [t](a.md 'Title').",
    },
    {
      expected: 'See [t](root/a.md  "Title").',
      name: 'a link with two spaces before its title',
      text: 'See [t](a.md  "Title").',
    },
    {
      expected: 'See [note]: a.md for more.',
      name: 'reference-definition syntax in the middle of a line',
      text: 'See [note]: a.md for more.',
    },
    {
      expected: '   [x]: root/a.md',
      name: 'a reference definition indented by three spaces',
      text: '   [x]: a.md',
    },
    {
      expected: '    [x]: a.md',
      name: 'a line indented by four spaces, which is no definition',
      text: '    [x]: a.md',
    },
    {
      expected:
        'A slug never holds a backtick (`).\n\nRead [a](root/a.md) before `check`.',
      name: 'a link before a real span in a later paragraph, after a lone backtick',
      text: 'A slug never holds a backtick (`).\n\nRead [a](a.md) before `check`.',
    },
    {
      expected:
        'Write a literal backtick as \\`.\n\nRead [a](root/a.md) before `check`.',
      name: 'a link before a real span in a later paragraph, after an escaped backtick',
      text: 'Write a literal backtick as \\`.\n\nRead [a](a.md) before `check`.',
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
