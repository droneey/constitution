import { afterEach, describe, expect, test } from 'bun:test';

import { cleanup, render } from '@testing-library/react';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { DocsRepositoryIcon } from '../docs-repository-icon';

afterEach(cleanup);

describe('DocsRepositoryIcon', () => {
  test('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    render(<DocsRepositoryIcon />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
