import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render } from '@testing-library/react';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { DocsRepositoryIcon } from '../docs-repository-icon';

afterEach(cleanup);

describe('DocsRepositoryIcon', () => {
  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    render(<DocsRepositoryIcon />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
