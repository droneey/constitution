import { afterEach, describe, expect, test } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import type { GetVersions } from '#/features/versions';
import { createVersion } from '#/features/versions';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs, versionsFixture } from '../../../../__tests__/docs.fixtures';
import { DocsLocationContext } from '../../../../app/providers';
import { DocsVersionWidget } from '../docs-version-widget';

afterEach(cleanup);

const olderRelease = createVersion('0.69.2');

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
    release: olderRelease,
  });
};

describe('DocsVersionWidget', () => {
  test('should name the release the site was built from', () => {
    // Arrange
    const getVersions = createFakeGetVersions(versionsFixture()).getVersions;

    // Act
    renderWidget(getVersions);

    // Assert
    expect(screen.getByRole('button').textContent).toBe('v0.69.2');
  });

  test('should link every release to the page the reader is on when the releases have loaded', async () => {
    // Arrange
    renderWidget(createFakeGetVersions(versionsFixture()).getVersions);

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
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: olderRelease,
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

  test('should show no menu when the root names no release', () => {
    // Arrange
    const getVersions = createFakeGetVersions(versionsFixture()).getVersions;

    // Act
    renderInDocs(onGuidePage(), {
      getVersions,
      release: undefined,
    });

    // Assert
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('should say the releases are unavailable when they cannot be read', async () => {
    // Arrange
    renderWidget(createFakeGetVersions(new Error('versions.json is unreachable')).getVersions);

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect((await screen.findByText('Versions unavailable')).textContent).toBe(
      'Versions unavailable',
    );
  });

  test('should pass the WCAG 2.2 A and AA scan when the reader opens the menu', async () => {
    // Arrange
    renderWidget(createFakeGetVersions(versionsFixture()).getVersions);
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
