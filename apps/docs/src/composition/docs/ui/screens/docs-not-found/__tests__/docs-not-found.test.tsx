import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen } from '@testing-library/react';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';
import { DocsNotFoundScreen } from '../docs-not-found';

afterEach(cleanup);

describe('DocsNotFoundScreen', () => {
  it('should head the page 404 and lead the reader back home', async () => {
    // Arrange
    const screenUnderTest = <DocsNotFoundScreen />;

    // Act
    await renderInDocs(screenUnderTest);

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
      '404',
      '/',
    ]);
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    await renderInDocs(<DocsNotFoundScreen />);

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
