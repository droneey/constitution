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

  it('should return the whole text as the body when the opening delimiter never closes', () => {
    // Arrange
    const text = '---\nid: ui\n# UI\n';

    // Act
    const document = splitFrontMatter(text);

    // Assert
    expect(document).toStrictEqual({
      body: text,
      frontMatter: undefined,
    });
  });

  it('should return the whole text as the body when the text does not open with a delimiter', () => {
    // Arrange
    const text = '# UI\n---\n';

    // Act
    const document = splitFrontMatter(text);

    // Assert
    expect(document).toStrictEqual({
      body: text,
      frontMatter: undefined,
    });
  });
});
