import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen, waitFor, within } from '@testing-library/react';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';
import { DocsHomeFrame } from '../docs-home-frame';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const renderFrame = async (): Promise<void> => {
  await renderInDocs(
    <DocsHomeFrame>
      <p>The page</p>
    </DocsHomeFrame>,
  );
};

describe('DocsHomeFrame', () => {
  it('should make its main region the target of the skip link', async () => {
    // Act
    await renderFrame();

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

  it('should name the site and link its repository', async () => {
    // Act
    await renderFrame();

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

  it('should open the repository in a new tab from an icon named GitHub', async () => {
    // Act
    await renderFrame();

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
    await renderFrame();

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
    await renderFrame();

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
