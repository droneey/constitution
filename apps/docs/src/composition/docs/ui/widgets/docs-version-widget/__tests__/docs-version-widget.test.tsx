import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import type { GetVersions } from '#/features/versions';
import { Version, VersionsError, VersionsFailure } from '#/features/versions';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs, versionsFixture } from '../../../../__tests__/docs.fixtures';
import { DocsLocationContext } from '../../../../app/providers';
import { DocsVersionWidget } from '../docs-version-widget';

afterEach(cleanup);

const olderRelease = Version.create('0.69.2');

/** on an older release's site, at the address the router reads, without the site's base */
const onGuidePage = (): ReactElement => (
  <DocsLocationContext
    value={{
      href: '/docs/guides/write-a-pack',
      path: 'guides/write-a-pack.md',
    }}
  >
    <DocsVersionWidget />
  </DocsLocationContext>
);

const versionLinks = (): (string | undefined)[] =>
  within(
    screen.getByRole('navigation', {
      name: 'Versions',
    }),
  )
    .getAllByRole('link')
    .map((link) => link.getAttribute('href') ?? undefined);

const renderWidget = (getVersions: GetVersions): void => {
  renderInDocs(onGuidePage(), {
    getVersions,
    release: olderRelease,
  });
};

describe('DocsVersionWidget', () => {
  it('should name the release the site was built from', () => {
    // Arrange
    const getVersions = createFakeGetVersions(versionsFixture()).getVersions;

    // Act
    renderWidget(getVersions);

    // Assert
    expect(screen.getByRole('button').textContent).toBe('v0.69.2');
  });

  it('should link every release to the page the reader is on when the releases have loaded', async () => {
    // Arrange
    renderWidget(createFakeGetVersions(versionsFixture()).getVersions);

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() =>
      expect(versionLinks()).toStrictEqual([
        '/v0.70.0/docs/guides/write-a-pack',
        '/v0.69.2/docs/guides/write-a-pack',
      ]),
    );
  });

  it('should link every release to the root of its site when no page holds the menu', async () => {
    // Arrange
    renderInDocs(<DocsVersionWidget />, {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: olderRelease,
    });

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() =>
      expect(versionLinks()).toStrictEqual([
        '/v0.70.0/',
        '/v0.69.2/',
      ]),
    );
  });

  it.each([
    {
      condition: 'this site belongs to an older release',
      expected: [
        '/docs/guides/write-a-pack',
        '/v0.70.0/docs/guides/write-a-pack',
        '/v0.69.2/docs/guides/write-a-pack',
      ],
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: olderRelease,
    },
    {
      condition: 'the releases cannot be read, so the latest is unknown',
      expected: [
        '/v0.69.2/docs/guides/write-a-pack',
      ],
      getVersions: createFakeGetVersions(
        new VersionsError({
          code: VersionsFailure.Unreachable,
          details: {
            address: '/versions.json',
          },
        }),
      ).getVersions,
      release: olderRelease,
    },
    {
      condition: 'this site belongs to the latest release',
      expected: [
        '/v0.70.0/docs/guides/write-a-pack',
        '/v0.69.2/docs/guides/write-a-pack',
      ],
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: Version.create('0.70.0'),
    },
  ] satisfies {
    condition: string;
    expected: string[];
    getVersions: GetVersions;
    release: Version;
  }[])(
    "should lead beside the menu to the page's address with no release, which the host gives the latest's, only when $condition",
    async ({ expected, getVersions, release }) => {
      // Arrange
      renderInDocs(onGuidePage(), {
        getVersions,
        release,
      });

      // Act
      await userEvent.click(screen.getByRole('button'));

      // Assert
      await waitFor(() =>
        expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toStrictEqual(
          expected,
        ),
      );
    },
  );

  it('should show no menu when the root names no release', () => {
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

  it('should say the releases are unavailable when they cannot be read', async () => {
    // Arrange
    renderWidget(
      createFakeGetVersions(
        new VersionsError({
          code: VersionsFailure.Unreachable,
          details: {
            address: '/versions.json',
          },
        }),
      ).getVersions,
    );

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect((await screen.findByText('Versions unavailable')).textContent).toBe(
      'Versions unavailable',
    );
  });

  it('should pass the WCAG 2.2 A and AA scan when the reader opens the menu', async () => {
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
