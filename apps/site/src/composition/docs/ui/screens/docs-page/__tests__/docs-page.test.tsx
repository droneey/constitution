import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';

import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { screenViolationsIn } from '../../../../__tests__/axe.fixtures';
import {
  pageEntryFixture,
  pageTreeFixture,
  renderInDocs,
  versionsFixture,
} from '../../../../__tests__/docs.fixtures';
import { frameFake } from '../../../../__tests__/docs-frame.fake';
import { loadedVersions } from '../../../../__tests__/get-versions.fake';
import { DocsPageScreen } from '../docs-page';

const BUILT_VERSION = process.env.VITE_CONSTITUTION_VERSION;

beforeEach(() => {
  process.env.VITE_CONSTITUTION_VERSION = '0.70.0';
});

afterEach(() => {
  cleanup();
  mock.restore();
  process.env.VITE_CONSTITUTION_VERSION = BUILT_VERSION;
});

const overview = pageEntryFixture();
const guide = pageEntryFixture({
  description: 'How a project adds blocks of its own.',
  title: 'Write a pack',
});

/** the screen on the overview, as its route hands it over */
const overviewPage = (): ReactElement => (
  <DocsPageScreen
    href='/docs'
    page={overview}
    pageTree={pageTreeFixture()}
    path='index.md'
  />
);

/** the same screen on a guide, as its route hands it over after a navigation */
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

/** the router hands the screen the next page, whose contents load before it shows */
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
  test('should show the page heading, summary and body when its contents have loaded', async () => {
    // Arrange
    const page = overviewPage();

    // Act
    renderInDocs(page);

    // Assert
    expect([
      (await headingOf('Overview')).textContent,
      screen.getByText('The rules a repository is built by.').tagName,
      screen
        .getByRole('link', {
          name: 'one home',
        })
        .getAttribute('href'),
    ]).toStrictEqual([
      'Overview',
      'P',
      '/docs/core/placement',
    ]);
  });

  test('should make the page the main region the skip link targets', async () => {
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
      -1,
    ]);
  });

  test('should keep the heading out of the tab order', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    const heading = await headingOf('Overview');

    // Assert
    expect(heading.tabIndex).toBe(-1);
  });

  test('should leave focus where it is when the site opens on the page', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    expect(document.activeElement).toBe(document.body);
  });

  test('should move focus to the heading when the reader opens another page', async () => {
    // Arrange
    const rendered = renderInDocs(overviewPage());
    await headingOf('Overview');

    // Act
    await navigate(rendered, guidePage());

    // Assert
    expect(document.activeElement?.textContent).toBe('Write a pack');
  });

  test('should leave the scroll to the router when the heading takes focus', async () => {
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

  test('should list the page contents beside it and in its header', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    expect([
      screen.getByRole('heading', {
        name: 'On this page',
      }).tagName,
      ...screen.getAllByRole('progressbar').map((progress) => progress.getAttribute('aria-label')),
    ]).toStrictEqual([
      'H3',
      'Reading progress',
    ]);
  });

  test('should slide a block under the page contents once they have loaded', async () => {
    // Arrange
    renderInDocs(overviewPage());

    // Act
    await headingOf('Overview');

    // Assert
    expect(document.querySelectorAll('[data-toc-list] > [data-glide]').length).toBe(1);
  });

  test('should offer the version menu above the search field in the sidebar', async () => {
    // Arrange
    renderInDocs(overviewPage(), {
      getVersions: loadedVersions(versionsFixture()),
    });

    // Act
    await headingOf('Overview');

    // Assert
    expect((await versionMenu()).dataset.sidebarField).toBe('');
  });

  test('should link the releases to the page the reader is on', async () => {
    // Arrange
    renderInDocs(guidePage(), {
      getVersions: loadedVersions(versionsFixture()),
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

  test('should keep the sidebar on the frame when the site opens on a wide screen', async () => {
    // Arrange
    const { frame, marks } = frameFake();

    // Act
    renderInDocs(overviewPage(), {
      frame,
    });

    // Assert
    await headingOf('Overview');
    expect(marks.at(-1)).toBe(false);
  });

  test('should collapse the sidebar again when the reader opens another page on a narrow screen', async () => {
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
    expect(marks.at(-1)).toBe(true);
  });

  test('should pass the WCAG 2.2 A and AA scan when its contents have loaded', async () => {
    // Arrange
    renderInDocs(overviewPage(), {
      getVersions: loadedVersions(versionsFixture()),
    });
    await headingOf('Overview');

    // Act
    const violations = await screenViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
