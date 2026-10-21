import { afterEach, describe, expect, test } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Releases } from '#/features/versions';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { versionsFixture } from '../../../../__tests__/docs.fixtures';
import { DocsVersionMenu } from '../docs-version-menu';

afterEach(cleanup);

const loaded: Releases = {
  status: 'loaded',
  ...versionsFixture(),
};

const openMenu = async (): Promise<void> => {
  await userEvent.click(screen.getByRole('button'));
};

const linkTo = (version: string): HTMLElement =>
  screen.getByRole('link', {
    name: new RegExp(`^v${version.replaceAll('.', '[.]')}`),
  });

describe('DocsVersionMenu', () => {
  test.each([
    {
      condition: 'the releases are loading',
      releases: {
        status: 'loading',
      },
      shown: 'v0.70.0',
    },
    {
      condition: 'this release is the latest',
      releases: loaded,
      shown: 'v0.70.0latest',
    },
  ] satisfies {
    condition: string;
    releases: Releases;
    shown: string;
  }[])(
    'should name this release, and whether it is the latest, when $condition',
    ({ releases, shown }) => {
      // Arrange
      const current = '0.70.0';

      // Act
      render(
        <DocsVersionMenu
          current={current}
          href='/docs/guides/write-a-pack'
          releases={releases}
        />,
      );

      // Assert
      expect(screen.getByRole('button').textContent).toBe(shown);
    },
  );

  test('should name no release the latest when this site belongs to an older one', () => {
    // Arrange
    const current = '0.69.2';

    // Act
    render(
      <DocsVersionMenu
        current={current}
        href='/v0.69.2/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Assert
    expect(screen.getByRole('button').textContent).toBe('v0.69.2');
  });

  test.each([
    {
      condition: 'the releases are loading',
      notice: 'Loading versions…',
      releases: {
        status: 'loading',
      },
    },
    {
      condition: 'the releases cannot be read',
      notice: 'Versions unavailable',
      releases: {
        status: 'failed',
      },
    },
  ] satisfies {
    condition: string;
    notice: string;
    releases: Releases;
  }[])(
    'should offer only this release and say why when $condition',
    async ({ notice, releases }) => {
      // Arrange
      render(
        <DocsVersionMenu
          current='0.70.0'
          href='/docs/guides/write-a-pack'
          releases={releases}
        />,
      );

      // Act
      await openMenu();

      // Assert
      expect([
        ...screen.getAllByRole('link').map((link) => link.getAttribute('href')),
        screen.getByRole('navigation', {
          name: 'Versions',
        }).textContent,
      ]).toStrictEqual([
        '/docs/guides/write-a-pack',
        `v0.70.0${notice}`,
      ]);
    },
  );

  test('should link every release to the same page in its site when the releases have loaded', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.70.0'
        href='/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Act
    await openMenu();

    // Assert
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toStrictEqual([
      '/docs/guides/write-a-pack',
      '/v0.69.2/docs/guides/write-a-pack',
    ]);
  });

  test('should list the releases with no notice when they have loaded', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.70.0'
        href='/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Act
    await openMenu();

    // Assert
    expect(
      screen.getByRole('navigation', {
        name: 'Versions',
      }).textContent,
    ).toBe('v0.70.0latestv0.69.2');
  });

  test('should mark the latest release among the releases when they have loaded', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.69.2'
        href='/v0.69.2/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Act
    await openMenu();

    // Assert
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toStrictEqual([
      'v0.70.0latest',
      'v0.69.2',
    ]);
  });

  test('should mark this release as the current page when the reader opens the menu', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.69.2'
        href='/v0.69.2/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Act
    await openMenu();

    // Assert
    expect([
      linkTo('0.70.0').hasAttribute('aria-current'),
      linkTo('0.69.2').getAttribute('aria-current'),
    ]).toStrictEqual([
      false,
      'page',
    ]);
  });

  test('should tick only this release when the reader opens the menu', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.69.2'
        href='/v0.69.2/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );

    // Act
    await openMenu();

    // Assert
    expect([
      // biome-ignore lint/plugin/queries-by-role-label-text: the release's mark is an icon hidden from assistive technology, which no role, label or text names
      linkTo('0.70.0').querySelector('svg') === null,
      // biome-ignore lint/plugin/queries-by-role-label-text: the release's mark is an icon hidden from assistive technology, which no role, label or text names
      linkTo('0.69.2').querySelector('svg') === null,
    ]).toStrictEqual([
      true,
      false,
    ]);
  });

  test('should pass the WCAG 2.2 A and AA scan when the reader opens the menu', async () => {
    // Arrange
    render(
      <DocsVersionMenu
        current='0.69.2'
        href='/v0.69.2/docs/guides/write-a-pack'
        releases={loaded}
      />,
    );
    await openMenu();

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
