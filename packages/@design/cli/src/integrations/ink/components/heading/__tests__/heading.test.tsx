import { describe, expect, it } from 'bun:test';

import { renderWithTheme } from '../../../__tests__/ink.fixtures';
import { Heading } from '../heading';

describe('Heading', () => {
  it('should draw the title', () => {
    // Arrange
    const tree = <Heading title='Checks' />;

    // Act
    const { lastFrame } = renderWithTheme(tree);

    // Assert
    expect(lastFrame()).toBe('Checks');
  });
});
