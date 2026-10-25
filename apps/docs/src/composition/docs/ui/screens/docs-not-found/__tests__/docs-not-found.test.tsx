import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen, waitFor, within } from '@testing-library/react';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';
import { DocsNotFoundScreen } from '../docs-not-found';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('DocsNotFoundScreen', () => {
  it('should head the page 404 and lead the reader back home', () => {
    // Arrange
    const screenUnderTest = <DocsNotFoundScreen />;

    // Act
    renderInDocs(screenUnderTest);

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

  it('should make its main region the target of the skip link', () => {
    // Arrange
    const screenUnderTest = <DocsNotFoundScreen />;

    // Act
    renderInDocs(screenUnderTest);

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

  it('should name the site and link its repository', () => {
    // Arrange
    const screenUnderTest = <DocsNotFoundScreen />;

    // Act
    renderInDocs(screenUnderTest);

    // Assert
    expect([
      screen
        .getByRole('link', {
          name: 'Constitution',
        })
        .getAttribute('href'),
      ...screen
        .getAllByRole('link', {
          name: 'GitHub',
        })
        .map((link) => link.getAttribute('href')),
    ]).toStrictEqual([
      '/',
      'https://github.com/droneey/constitution',
    ]);
  });

  it('should open the repository in a new tab from an icon named GitHub', () => {
    // Arrange
    const screenUnderTest = <DocsNotFoundScreen />;

    // Act
    renderInDocs(screenUnderTest);

    // Assert
    const repository = screen.getByRole('link', {
      name: 'GitHub',
    });

    expect([
      repository.textContent,
      repository.getAttribute('target'),
      repository.getAttribute('rel'),
    ]).toStrictEqual([
      '',
      '_blank',
      'noreferrer noopener',
    ]);
  });

  it('should slide a block under the items of a menu that opens on it', async () => {
    // Arrange
    renderInDocs(<DocsNotFoundScreen />);

    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');

    const lightTheme = document.createElement('div');
    lightTheme.setAttribute('role', 'menuitem');
    lightTheme.textContent = 'Light';

    menu.append(lightTheme);

    // Act
    document.body.append(menu);

    // Assert
    await waitFor(() => expect(within(menu).getAllByTestId('glide').length).toBe(1));
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderInDocs(<DocsNotFoundScreen />);

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
