import { describe, expect, it } from 'bun:test';

import { splitFrontMatter } from '../front-matter.utils';

describe('splitFrontMatter', () => {
  it('should split the front matter from the body when the text opens with a delimited block', () => {
    // Arrange
    const text = '---\nid: ui\n---\n# UI\n';

    // Act
    const document = splitFrontMatter(text);

    // Assert
    expect(document).toStrictEqual({
      body: '# UI\n',
      frontMatter: 'id: ui',
    });
  });

  it.each([
    {
      name: 'the opening delimiter never closes',
      text: '---\nid: ui\n# UI\n',
    },
    {
      name: 'the text does not open with a delimiter',
      text: '# UI\n---\n',
    },
  ])('should return the whole text as the body when $name', ({ text }) => {
    // Arrange
    const input = text;

    // Act
    const document = splitFrontMatter(input);

    // Assert
    expect(document).toStrictEqual({
      body: text,
      frontMatter: undefined,
    });
  });
});
