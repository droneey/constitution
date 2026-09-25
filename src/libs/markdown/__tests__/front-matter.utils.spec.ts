import { describe, expect, it } from 'bun:test';

import { splitFrontMatter } from '../front-matter.utils';

describe('splitFrontMatter', () => {
  it('should split the front matter from the body', () => {
    // Act
    const document = splitFrontMatter('---\nid: ui\n---\n\n# UI\n');

    // Assert
    expect(document).toStrictEqual({
      body: '\n# UI\n',
      frontMatter: 'id: ui',
    });
  });

  it('should return the whole text as the body when there is no front matter', () => {
    // Act
    const document = splitFrontMatter('# UI\n');

    // Assert
    expect(document).toStrictEqual({
      body: '# UI\n',
      frontMatter: undefined,
    });
  });

  it('should treat an unclosed front matter as none', () => {
    // Act
    const document = splitFrontMatter('---\nid: ui\n# UI\n');

    // Assert
    expect(document.frontMatter).toBeUndefined();
  });
});
