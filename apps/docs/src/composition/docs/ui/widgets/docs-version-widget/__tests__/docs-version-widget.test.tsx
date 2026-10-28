import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import type { GetVersions } from '#/features/versions';
import { Version, VersionsError, VersionsFailure } from '#/features/versions';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs, versionsFixture } from '../../../../__tests__/docs.fixtures';
import type { ReportErrorFake } from '../../../../__tests__/report-error.fake';
import { reportErrorFake } from '../../../../__tests__/report-error.fake';
import { DocsLocationContext } from '../../../../app/providers';
import { DocsVersionWidget } from '../docs-version-widget';

let reportError: ReportErrorFake;

beforeEach(() => {
  reportError = reportErrorFake();
});

afterEach(() => {
  cleanup();
  reportError.restore();
});

const olderRelease = Version.create('0.69.2');

const defect = new RangeError('a defect');

const VERSIONS_ADDRESS = '/versions.json';

const unreachable = (): VersionsError =>
  new VersionsError({
    code: VersionsFailure.Unreachable,
    details: {
      address: VERSIONS_ADDRESS,
    },
  });

const onGuidePage = (): ReactElement => (
  <DocsLocationContext
    value={{
      href: '/docs/guides/write-a-pack',
    }}
  >
    <DocsVersionWidget />
  </DocsLocationContext>
);

const renderWidget = (getVersions: GetVersions | undefined): Promise<RenderResult> =>
  renderInDocs(onGuidePage(), {
    getVersions,
    release: olderRelease,
  });

const openMenu = async (): Promise<void> => {
  await userEvent.click(screen.getByRole('button'));
};

const releasesSettled = (): Promise<void> =>
  waitFor(() => expect(screen.queryByText('Loading versions…')).toBeNull());

const noticeAddress = (): string | undefined =>
  screen
    .queryByRole('link', {
      name: /^Read v/,
    })
    ?.getAttribute('href') ?? undefined;

const releaseAddresses = (): (string | undefined)[] =>
  within(
    screen.getByRole('navigation', {
      name: 'Versions',
    }),
  )
    .getAllByRole('link')
    .map((link) => link.getAttribute('href') ?? undefined);

describe('DocsVersionWidget', () => {
  it.each([
    {
      condition: 'the read has not answered yet',
      getVersions: createFakeGetVersions().getVersions,
    },
    {
      condition: 'the root provides no read',
      getVersions: undefined,
    },
  ])('should say the releases are loading when $condition', async ({ getVersions }) => {
    // Arrange
    await renderWidget(getVersions);

    // Act
    await openMenu();

    // Assert
    expect(screen.queryByText('Loading versions…')).not.toBeNull();
  });

  it('should link every release to the root of its site when no page holds the menu', async () => {
    // Arrange
    await renderInDocs(<DocsVersionWidget />, {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: olderRelease,
    });

    // Act
    await openMenu();

    // Assert
    await waitFor(() =>
      expect(releaseAddresses()).toStrictEqual([
        '/v0.70.0/',
        '/v0.69.2/',
      ]),
    );
  });

  it("should lead beside the menu to the page's address in the latest release when this site belongs to an older release", async () => {
    // Arrange
    await renderInDocs(onGuidePage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: olderRelease,
    });
    await openMenu();

    // Act
    await releasesSettled();

    // Assert
    expect(noticeAddress()).toBe('/v0.70.0/docs/guides/write-a-pack');
  });

  it.each([
    {
      condition: 'the releases cannot be read, so the latest is unknown',
      getVersions: createFakeGetVersions(unreachable()).getVersions,
      release: olderRelease,
    },
    {
      condition: 'this site belongs to the latest release',
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
      release: Version.create('0.70.0'),
    },
  ] satisfies {
    condition: string;
    getVersions: GetVersions;
    release: Version;
  }[])(
    'should show no notice beside the menu when $condition',
    async ({ getVersions, release }) => {
      // Arrange
      await renderInDocs(onGuidePage(), {
        getVersions,
        release,
      });
      await openMenu();

      // Act
      await releasesSettled();

      // Assert
      expect(noticeAddress()).toBeUndefined();
    },
  );

  it('should show no menu when the root names no release', async () => {
    // Arrange
    const getVersions = createFakeGetVersions().getVersions;

    // Act
    await renderInDocs(onGuidePage(), {
      getVersions,
      release: undefined,
    });

    // Assert
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    {
      condition: 'the site is out of reach',
      failure: unreachable(),
      reported: [],
    },
    {
      condition: 'the read meets a defect, which it reports',
      failure: defect,
      reported: [
        defect,
      ],
    },
  ] satisfies {
    condition: string;
    failure: Error;
    reported: Error[];
  }[])('should say the releases are unavailable when $condition', async ({ failure, reported }) => {
    // Arrange
    await renderWidget(createFakeGetVersions(failure).getVersions);

    // Act
    await openMenu();

    // Assert
    expect({
      notice: (await screen.findByText('Versions unavailable')).textContent,
      reported: reportError.reported,
    }).toStrictEqual({
      notice: 'Versions unavailable',
      reported,
    });
  });

  it('should abort the read when the widget leaves the page', async () => {
    // Arrange
    const { getVersions, signals } = createFakeGetVersions();
    const { unmount } = await renderWidget(getVersions);

    // Act
    unmount();

    // Assert
    expect(signals.map((signal) => signal.aborted)).toStrictEqual([
      true,
    ]);
  });

  it('should lead to the newer latest release when the root provides another read', async () => {
    // Arrange
    const providers = {
      getVersions: createFakeGetVersions().getVersions,
      release: olderRelease,
    };
    const rendered = await renderInDocs(onGuidePage(), providers);
    const newer = createFakeGetVersions(
      versionsFixture({
        latest: Version.create('0.71.0'),
        versions: [
          Version.create('0.71.0'),
          olderRelease,
        ],
      }),
    );

    // Act
    providers.getVersions = newer.getVersions;
    rendered.rerender(onGuidePage());

    // Assert
    await waitFor(() =>
      expect(screen.getAllByRole('link').map((link) => link.textContent)).toStrictEqual([
        'Read v0.71.0',
      ]),
    );
  });

  it('should pass the WCAG 2.2 A and AA scan when it leads to the latest release', async () => {
    // Arrange
    await renderWidget(createFakeGetVersions(versionsFixture()).getVersions);
    await screen.findByRole('link', {
      name: 'Read v0.70.0',
    });

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
