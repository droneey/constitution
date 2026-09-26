import { describe, expect, it } from 'bun:test';

import { localLinkTargets } from '../links.utils';

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
