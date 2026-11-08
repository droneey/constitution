import { describe, expect, it } from 'bun:test';

import { proseOf } from '../prose.utils';

describe('proseOf', () => {
  it.each([
    {
      expected: 'Each port is named. ',
      name: 'a heading',
      text: '## Ports\nEach port is named.\n',
    },
    {
      expected: 'A port in a file .',
      name: 'a term id after a term',
      text: 'A port in a file {#port-file}.',
    },
    {
      expected: 'An empty id goes.',
      name: 'an empty term id',
      text: 'An empty id {#} goes.',
    },
    {
      expected: 'A file name and a path: .',
      name: 'a term id and a block path that touch the words around them',
      text: 'A file{#port-file}name and a path:client/browser.',
    },
    {
      expected: 'See and .',
      name: 'a block path of two parts and one of three',
      text: 'See client/browser and contracts/api/rest.',
    },
    {
      expected: 'The folder ports/ and the word client stay.',
      name: 'a folder and a word of one part',
      text: 'The folder ports/ and the word client stay.',
    },
    {
      expected: 'Run and . ',
      name: 'code in a span and in a fence',
      text: 'Run `bun test` and `a/b`.\n```sh\nbun test\n```\n',
    },
  ])('should keep only the prose of $name', ({ expected, text }) => {
    // Act
    const prose = proseOf(text);

    // Assert
    expect(prose).toBe(expected);
  });
});
