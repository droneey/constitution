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

  it.each([
    {
      line: '#hashtag',
      name: 'no space follows its hashes',
    },
    {
      line: 'Write the client in C# and F#.',
      name: 'its hash stands inside the line',
    },
  ])('should keep a line as text of its section when $name', ({ line }) => {
    // Arrange
    const text = `# Title\n${line}`;

    // Act
    const sections = sectionsOf(text);

    // Assert
    expect(sections).toStrictEqual([
      {
        heading: '# Title',
        lines: [
          line,
        ],
      },
    ]);
  });
});
