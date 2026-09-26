import { describe, expect, it } from 'bun:test';

import { sectionsOf } from '../sections.utils';

describe('sectionsOf', () => {
  it('should group the lines under each heading and drop the text before the first when the text has headings of several levels', () => {
    // Arrange
    const text = 'intro\n# Title\na\n## Part\nb\n###\nc';

    // Act
    const sections = sectionsOf(text);

    // Assert
    expect(sections).toStrictEqual([
      {
        heading: '# Title',
        lines: [
          'a',
        ],
      },
      {
        heading: '## Part',
        lines: [
          'b',
        ],
      },
      {
        heading: '###',
        lines: [
          'c',
        ],
      },
    ]);
  });

  it('should read a hash without a following space as text when the line is not a heading', () => {
    // Arrange
    const text = '# Title\n#hashtag';

    // Act
    const sections = sectionsOf(text);

    // Assert
    expect(sections).toStrictEqual([
      {
        heading: '# Title',
        lines: [
          '#hashtag',
        ],
      },
    ]);
  });
});
