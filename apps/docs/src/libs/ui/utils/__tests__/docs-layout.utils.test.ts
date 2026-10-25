import { afterEach, describe, expect, it } from 'bun:test';

import { keepOneLayout } from '../docs-layout.utils';

const pageMatchMedia = globalThis.matchMedia;

afterEach(() => {
  globalThis.matchMedia = pageMatchMedia;
});

describe('keepOneLayout', () => {
  it.each([
    {
      name: 'the library asks whether to draw its drawer',
      query: '(width < 768px)',
      expected: 'not all',
    },
    {
      name: 'another query is asked',
      query: '(width < 1024px)',
      expected: '(width < 1024px)',
    },
  ])('should ask the page "$expected" when $name', ({ query, expected }) => {
    // Arrange
    const asked: string[] = [];

    globalThis.matchMedia = (media: string): MediaQueryList => {
      asked.push(media);

      return pageMatchMedia(media);
    };
    keepOneLayout();

    // Act
    globalThis.matchMedia(query);

    // Assert
    expect(asked).toStrictEqual([
      expected,
    ]);
  });
});
