import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { DocsRepositoryIcon } from '../docs-repository-icon';

afterEach(cleanup);

describe('DocsRepositoryIcon', () => {
  it('should draw the mark hidden from assistive technology, since the link it sits in carries the name', () => {
    // Act
    render(<DocsRepositoryIcon />);

    // Assert
    expect(screen.getByTestId('repository-mark').getAttribute('aria-hidden')).toBe('true');
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    render(<DocsRepositoryIcon />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
