import { describe, expect, it } from 'bun:test';

import { remarkRelease } from '../remark-release.adapter';
import { treeOf } from './mdast.fixtures';

describe('remarkRelease', () => {
  it.each([
    {
      condition: 'a block of code leaves the placeholder',
      expected: '```toml\nversion = "1.2.3"\n```',
      markdown: '```toml\nversion = "<version>"\n```',
    },
    {
      condition: 'inline code leaves the placeholder',
      expected: 'It reads `pins 1.2.3`.',
      markdown: 'It reads `pins <version>`.',
    },
    {
      condition: 'the code leaves it twice',
      expected: '```\n1.2.3 and 1.2.3\n```',
      markdown: '```\n<version> and <version>\n```',
    },
  ])('should name the release where $condition', ({ expected, markdown }) => {
    // Arrange
    const tree = treeOf(markdown);

    // Act
    remarkRelease({
      version: '1.2.3',
    })(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf(expected));
  });

  it('should leave the placeholder in prose, which names no release to pin', () => {
    // Arrange
    const tree = treeOf('Pin the release, as in <version>.');

    // Act
    remarkRelease({
      version: '1.2.3',
    })(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf('Pin the release, as in <version>.'));
  });
});
