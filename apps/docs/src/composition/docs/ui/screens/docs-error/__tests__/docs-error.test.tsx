import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen } from '@testing-library/react';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';
import { DocsErrorScreen } from '../docs-error';

afterEach(cleanup);

describe('DocsErrorScreen', () => {
  it('should say the page could not be shown and lead the reader back home', async () => {
    // Act
    await renderInDocs(<DocsErrorScreen />);

    // Assert
    expect([
      screen.getByRole('heading', {
        level: 1,
      }).textContent,
      screen
        .getByRole('link', {
          name: 'Back to Home',
        })
        .getAttribute('href'),
    ]).toStrictEqual([
      'This page could not be shown',
      '/',
    ]);
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    await renderInDocs(<DocsErrorScreen />);

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
