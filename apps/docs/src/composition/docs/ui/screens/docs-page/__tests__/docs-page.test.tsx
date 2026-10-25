import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import {
  hydrateInDocs,
  pageEntryFixture,
  pageTreeFixture,
  renderInDocs,
  settledLoad,
  versionsFixture,
} from '../../../../__tests__/docs.fixtures';
import { FrameMark, frameFake } from '../../../../__tests__/docs-frame.fake';
import { PAGE_SCROLLER_SELECTOR } from '../../../constants';
import { DocsPageScreen } from '../docs-page';
import type { DocsPageEntry } from '../docs-page.types';

afterEach(() => {
  cleanup();
  mock.restore();
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
    pageTree={pageTreeFixture()}
    path='index.md'
  />
);

const guidePage = (): ReactElement => (
  <DocsPageScreen
    href='/docs/guides/write-a-pack'
    page={guide}
    pageTree={pageTreeFixture()}
    path='guides/write-a-pack.md'
  />
);

const headingOf = (title: string): Promise<HTMLElement> =>
  screen.findByRole('heading', {
    level: 1,
    name: title,
  });

/** the next page's contents load before it shows */
const navigate = (rendered: RenderResult, page: ReactElement): Promise<void> =>
  act(() => Promise.resolve(rendered.rerender(page)));

const lastOf = (elements: HTMLElement[]): HTMLElement => {
  const [last] = elements.slice(-1);

  if (last === undefined) {
    throw new Error('expected at least one element');
  }

  return last;
};

const versionMenu = (): Promise<HTMLElement> =>
  screen.findByRole('button', {
    name: /^v0[.]70[.]0/,
  });

describe('DocsPageScreen', () => {
  it('should show the page heading, summary and body when its contents have loaded', async () => {
    // Arrange
    const page = overviewPage();

    // Act
    renderInDocs(page);

    // Assert
    expect([
      (await headingOf('Overview')).textContent,
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
        pageTree={pageTreeFixture()}
        path='index.md'
      />
    );

    // Act
    renderInDocs(page);

    // Assert
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Overview',
      }).textContent,
    ).toBe('Overview');
  });

  it('should make the page the main region the skip link targets and the keyboard stops on', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

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
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    // biome-ignore lint/plugin/spec-never-selects-from-the-document: the router is configured with this selector for Fumadocs' scroller, which no role, label or text names, and this one case proves it names the main article's parent
    expect(document.querySelector(PAGE_SCROLLER_SELECTOR)).toBe(
      screen.getByRole('main').parentElement,
    );
  });

  it('should name the site and link its repository from an icon named GitHub', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

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
    // Arrange
    renderInDocs(overviewPage());

    // Act
    const heading = await headingOf('Overview');

    // Assert
    expect(heading.tabIndex).toBe(-1);
  });

  it('should leave focus where it is when the site opens on the page', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    expect(document.activeElement).toBe(document.body);
  });

  it('should move focus to the heading when the reader opens another page', async () => {
    // Arrange
    const rendered = renderInDocs(overviewPage());

    await headingOf('Overview');

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(document.activeElement).toBe(await headingOf('Write a pack'));
  });

  it('should leave the scroll to the router when the heading takes focus', async () => {
    // Arrange
    const rendered = renderInDocs(overviewPage());

    await headingOf('Overview');

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
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

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
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    expect(within(screen.getByTestId('toc-list')).getAllByTestId('glide').length).toBe(1);
  });

  it('should offer the version menu above the search field in the sidebar', async () => {
    // Arrange
    renderInDocs(overviewPage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });

    // Act
    await headingOf('Overview');

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
    renderInDocs(guidePage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });
    await headingOf('Write a pack');

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
    renderInDocs(overviewPage(), {
      frame,
    });

    // Assert
    await headingOf('Overview');
    expect(marks.at(-1)).toBe(FrameMark.Open);
  });

  it('should collapse the sidebar when the site opens on a narrow screen', async () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });

    // Act
    renderInDocs(overviewPage(), {
      frame,
    });

    // Assert
    await headingOf('Overview');
    expect(marks.at(-1)).toBe(FrameMark.Collapsed);
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
        pageTree={pageTreeFixture()}
        path='index.md'
      />
    );

    const { recovered } = await hydrateInDocs(
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
      recovered,
      marks.at(-1),
    ]).toStrictEqual([
      [],
      FrameMark.Collapsed,
    ]);
  });

  it('should collapse the sidebar again when the reader opens another page on a narrow screen', async () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });
    const rendered = renderInDocs(overviewPage(), {
      frame,
    });

    await headingOf('Overview');
    // the collapsed sidebar is out of reach, so the reader opens it from the page's header, last in the document
    await userEvent.click(
      lastOf(
        screen.getAllByRole('button', {
          name: 'Collapse Sidebar',
        }),
      ),
    );

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(marks.at(-1)).toBe(FrameMark.Collapsed);
  });

  it('should pass the WCAG 2.2 A and AA scan when its contents have loaded', async () => {
    // Arrange
    renderInDocs(overviewPage(), {
      getVersions: createFakeGetVersions(versionsFixture()).getVersions,
    });
    await headingOf('Overview');

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
