import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';
import { Page } from '#/features/content';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import {
  docsWrapperOf,
  hydrateInDocs,
  pageEntryFixture,
  pageTreeFixture,
  renderInDocs,
  settledLoad,
  versionsFixture,
} from '../../../../__tests__/docs.fixtures';
import { frameFake } from '../../../../__tests__/docs-frame.fake';
import { SidebarState } from '../../../../domain/entities';
import { PAGE_SCROLLER_SELECTOR } from '../../../constants';
import { DocsPageScreen } from '../docs-page';
import type { DocsPageEntry } from '../docs-page.types';

afterEach(() => {
  cleanup();
  mock.restore();
});

const overviewKey = Page.keyOf({
  collection: 'overview',
  path: 'README.md',
});

const overview = pageEntryFixture();
const guide = pageEntryFixture({
  description: 'How a project adds blocks of its own.',
  title: 'Write a pack',
});

const overviewPage = (): ReactElement => (
  <DocsPageScreen
    href='/docs'
    page={overview}
    pageKey={overviewKey}
    pageTree={pageTreeFixture()}
  />
);

const guidePage = (): ReactElement => (
  <DocsPageScreen
    href='/docs/guides/write-a-pack'
    page={guide}
    pageKey={Page.keyOf({
      collection: 'guide',
      path: 'guides/write-a-pack.md',
    })}
    pageTree={pageTreeFixture()}
  />
);

const headingOf = (title: string): HTMLElement =>
  screen.getByRole('heading', {
    level: 1,
    name: title,
  });

const navigate = (rendered: RenderResult, page: ReactElement): Promise<void> =>
  act(() => Promise.resolve(rendered.rerender(page)));

const firstCommitHeadingOf = async (page: ReactElement): Promise<string | undefined> => {
  render(page, {
    wrapper: docsWrapperOf({}),
  });

  const heading = screen.queryByRole('heading', {
    level: 1,
  })?.textContent;

  await act(() => Promise.resolve());

  return heading ?? undefined;
};

const lastOf = (elements: HTMLElement[]): HTMLElement => {
  const [last] = elements.slice(-1);

  if (last === undefined) {
    throw new Error('expected at least one element');
  }

  return last;
};

// Why: the page's header holds the last of the sidebar's buttons in the document.
const pageHeaderSidebarButton = (): HTMLElement =>
  lastOf(
    screen.getAllByRole('button', {
      name: 'Collapse Sidebar',
    }),
  );

const versionMenu = (): Promise<HTMLElement> =>
  screen.findByRole('button', {
    name: /^v0[.]70[.]0/,
  });

describe('DocsPageScreen', () => {
  it('should show the page heading, summary and body when its contents have loaded', async () => {
    // Arrange
    const page = overviewPage();

    // Act
    await renderInDocs(page);

    // Assert
    expect([
      headingOf('Overview').textContent,
      screen.getByText('The rules a repository is built by.').textContent,
      screen
        .getByRole('link', {
          name: 'one home',
        })
        .getAttribute('href'),
    ]).toStrictEqual([
      'Overview',
      'The rules a repository is built by.',
      '/docs/core/placement',
    ]);
  });

  it('should show the page in its first render when its route has loaded the body, so the router finds the heading an address names', async () => {
    // Arrange
    const load = await settledLoad();
    const page = (
      <DocsPageScreen
        href='/docs'
        page={pageEntryFixture({
          load,
        })}
        pageKey={overviewKey}
        pageTree={pageTreeFixture()}
      />
    );

    // Act
    const heading = await firstCommitHeadingOf(page);

    // Assert
    expect(heading).toBe('Overview');
  });

  it('should make the page the main region the skip link targets and the keyboard stops on', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    const main = screen.getByRole('main');

    expect([
      main.id,
      main.tabIndex,
    ]).toStrictEqual([
      'main',
      0,
    ]);
  });

  it('should name the element the page scrolls in, which the router brings back to the top', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    // biome-ignore lint/plugin/spec-never-selects-from-the-document: the router is configured with this selector for Fumadocs' scroller, which no role, label or text names, and this one case proves it names the main article's parent
    expect(document.querySelector(PAGE_SCROLLER_SELECTOR)).toBe(
      screen.getByRole('main').parentElement,
    );
  });

  it('should name the site and link its repository from an icon named GitHub', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    expect(
      screen
        .getAllByRole('link', {
          name: 'GitHub',
        })
        .map((link) => link.getAttribute('href')),
    ).toContain('https://github.com/droneey/constitution');
  });

  it('should keep the heading out of the tab order', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    expect(headingOf('Overview').tabIndex).toBe(-1);
  });

  it('should leave focus where it is when the site opens on the page', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    expect(document.activeElement).toBe(document.body);
  });

  it('should move focus to the heading when the reader opens another page', async () => {
    // Arrange
    const rendered = await renderInDocs(overviewPage());

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(document.activeElement).toBe(headingOf('Write a pack'));
  });

  it('should leave the scroll to the router when the heading takes focus', async () => {
    // Arrange
    const rendered = await renderInDocs(overviewPage());

    const focus = spyOn(HTMLElement.prototype, 'focus');

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(focus.mock.calls).toStrictEqual([
      [
        {
          preventScroll: true,
        },
      ],
    ]);
  });

  it('should list the page contents beside it and in its header', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    expect([
      screen.getByRole('heading', {
        name: 'On this page',
      }).textContent,
      screen.getByRole('progressbar').getAttribute('aria-label'),
    ]).toStrictEqual([
      'On this page',
      'Reading progress',
    ]);
  });

  it('should slide a block under the page contents once they have loaded', async () => {
    // Act
    await renderInDocs(overviewPage());

    // Assert
    expect(within(screen.getByTestId('toc-list')).getAllByTestId('glide').length).toBe(1);
  });

  it('should offer the version menu above the search field in the sidebar', async () => {
    // Act
    await renderInDocs(overviewPage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });

    // Assert
    const sidebar = within(screen.getByRole('complementary'));

    expect(
      (await versionMenu()).compareDocumentPosition(
        sidebar.getByRole('button', {
          name: /^Search/,
        }),
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should link the releases to the page the reader is on', async () => {
    // Arrange
    await renderInDocs(guidePage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });

    // Act
    await userEvent.click(await versionMenu());

    // Assert
    expect(
      (
        await screen.findByRole('link', {
          name: 'v0.69.2',
        })
      ).getAttribute('href'),
    ).toBe('/v0.69.2/docs/guides/write-a-pack');
  });

  it('should keep the sidebar on the frame when the site opens on a wide screen', async () => {
    // Arrange
    const { frame, marks } = frameFake();

    // Act
    await renderInDocs(overviewPage(), {
      frame,
    });

    // Assert
    expect(marks.at(-1)).toBe(SidebarState.Open);
  });

  it('should collapse the sidebar when the site opens on a narrow screen', async () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });

    // Act
    await renderInDocs(overviewPage(), {
      frame,
    });

    // Assert
    expect(marks.at(-1)).toBe(SidebarState.Collapsed);
  });

  it('should hydrate the page the server rendered when the site opens on a narrow screen before the body has loaded', async () => {
    // Arrange
    const body = Promise.withResolvers<{
      toc: [];
    }>();
    const serverLoad = await settledLoad();
    const { frame, marks } = frameFake({
      narrow: true,
    });

    const pageWith = (page: DocsPageEntry): ReactElement => (
      <DocsPageScreen
        href='/docs'
        page={page}
        pageKey={overviewKey}
        pageTree={pageTreeFixture()}
      />
    );

    const { recoverableErrors } = await hydrateInDocs(
      {
        client: pageWith(
          pageEntryFixture({
            load: () => body.promise,
          }),
        ),
        server: pageWith(
          pageEntryFixture({
            load: serverLoad,
          }),
        ),
      },
      {
        frame,
      },
    );

    // Act
    await act(async () => {
      body.resolve({
        toc: [],
      });
      await body.promise;
    });

    // Assert
    expect([
      recoverableErrors,
      marks.at(-1),
    ]).toStrictEqual([
      [],
      SidebarState.Collapsed,
    ]);
  });

  it('should collapse the sidebar again when the reader opens another page on a narrow screen', async () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });
    const rendered = await renderInDocs(overviewPage(), {
      frame,
    });

    await userEvent.click(pageHeaderSidebarButton());

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(marks.at(-1)).toBe(SidebarState.Collapsed);
  });

  it('should pass the WCAG 2.2 A and AA scan when its contents have loaded', async () => {
    // Arrange
    await renderInDocs(overviewPage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
