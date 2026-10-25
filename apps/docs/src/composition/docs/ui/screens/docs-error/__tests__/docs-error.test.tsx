import { afterEach, describe, expect, test } from 'bun:test';

import { cleanup, screen, waitFor } from '@testing-library/react';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';
import { DocsErrorScreen } from '../docs-error';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('DocsErrorScreen', () => {
  test('should say the page could not be shown and lead the reader back home', () => {
    // Act
    renderInDocs(<DocsErrorScreen />);

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

  test('should make its main region the target of the skip link', () => {
    // Act
    renderInDocs(<DocsErrorScreen />);

    // Assert
    const main = screen.getByRole('main');

    expect([
      main.id,
      main.tabIndex,
    ]).toStrictEqual([
      'main',
      -1,
    ]);
  });

  test('should name the site and link its repository', () => {
    // Act
    renderInDocs(<DocsErrorScreen />);

    // Assert
    expect(
      screen
        .getAllByRole('link', {
          name: 'GitHub',
        })
        .map((link) => link.getAttribute('href')),
    ).toStrictEqual([
      'https://github.com/droneey/constitution',
    ]);
  });

  test('should slide a block under the items of a menu that opens on it', async () => {
    // Arrange
    renderInDocs(<DocsErrorScreen />);

    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');

    const lightTheme = document.createElement('div');
    lightTheme.setAttribute('role', 'menuitem');
    lightTheme.textContent = 'Light';

    menu.append(lightTheme);

    // Act
    document.body.append(menu);

    // Assert
    // biome-ignore lint/plugin/queries-by-role-label-text: the glide is a decoration hidden from assistive technology, which CSS finds by its attribute
    await waitFor(() => expect(menu.querySelectorAll('[data-glide]').length).toBe(1));
  });

  test('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderInDocs(<DocsErrorScreen />);

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
