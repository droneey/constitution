import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GetVersions } from '#/features/versions';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs, versionsFixture } from '../../../../__tests__/docs.fixtures';
import { failedVersions, loadedVersions } from '../../../../__tests__/get-versions.fake';
import { DocsLocationContext } from '../../../../app/providers';
import { DocsVersionWidget } from '../docs-version-widget';

const BUILT_VERSION = process.env.VITE_CONSTITUTION_VERSION;

beforeEach(() => {
  process.env.VITE_CONSTITUTION_VERSION = '0.69.2';
});

afterEach(() => {
  cleanup();
  process.env.VITE_CONSTITUTION_VERSION = BUILT_VERSION;
});

/** on an older release's site */
const onGuidePage = (): ReactElement => (
  <DocsLocationContext
    value={{
      href: '/v0.69.2/docs/guides/write-a-pack',
      path: 'guides/write-a-pack.md',
    }}
  >
    <DocsVersionWidget />
  </DocsLocationContext>
);

const renderWidget = (getVersions: GetVersions): void => {
  renderInDocs(onGuidePage(), {
    getVersions,
  });
};

describe('DocsVersionWidget', () => {
  test('should name the release the site was built from', () => {
    // Arrange
    const getVersions = loadedVersions(versionsFixture());

    // Act
    renderWidget(getVersions);

    // Assert
    expect(screen.getByRole('button').textContent).toBe('v0.69.2');
  });

  test('should link every release to the page the reader is on when the releases have loaded', async () => {
    // Arrange
    renderWidget(loadedVersions(versionsFixture()));

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() =>
      expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toStrictEqual([
        '/docs/guides/write-a-pack',
        '/v0.69.2/docs/guides/write-a-pack',
      ]),
    );
  });

  test('should link every release to the root of its site when no page holds the menu', async () => {
    // Arrange
    renderInDocs(<DocsVersionWidget />, {
      getVersions: loadedVersions(versionsFixture()),
    });

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() =>
      expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toStrictEqual([
        '/',
        '/v0.69.2/',
      ]),
    );
  });

  test('should say the releases are unavailable when they cannot be read', async () => {
    // Arrange
    renderWidget(failedVersions);

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect((await screen.findByText('Versions unavailable')).textContent).toBe(
      'Versions unavailable',
    );
  });

  test('should pass the WCAG 2.2 A and AA scan when the reader opens the menu', async () => {
    // Arrange
    renderWidget(loadedVersions(versionsFixture()));
    await userEvent.click(screen.getByRole('button'));
    await screen.findByRole('navigation', {
      name: 'Versions',
    });

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
