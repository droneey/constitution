import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocsLayout, Sidebar } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { pageTreeFixture, renderInDocs } from '../../../../__tests__/docs.fixtures';
import { FrameMark, frameFake } from '../../../../__tests__/docs-frame.fake';
import { DocsLocationContext } from '../../../../app/providers';
import { DocsNavTitle } from '../../../components/docs-nav-title';
import { DocsRepositoryIcon } from '../../../components/docs-repository-icon';
import { REPOSITORY_LINK } from '../../../constants';
import { DocsSidebarWidget } from '../docs-sidebar-widget';

afterEach(cleanup);

const sidebar = {
  drawer: (): undefined => undefined,
  main: DocsSidebarWidget,
  provider: Sidebar.Provider,
};

const layoutOn = (path: string): ReactElement => (
  <DocsLocationContext
    value={{
      href: `/docs/${path}`,
      path,
    }}
  >
    <DocsLayout
      links={[
        {
          ...REPOSITORY_LINK,
          icon: <DocsRepositoryIcon />,
        },
      ]}
      nav={{
        title: <DocsNavTitle />,
      }}
      slots={{
        sidebar,
      }}
      tree={pageTreeFixture()}
    >
      <p>The page</p>
    </DocsLayout>
  </DocsLocationContext>
);

const toggle = (): HTMLElement =>
  screen.getByRole('button', {
    name: 'Collapse Sidebar',
  });

describe('DocsSidebarWidget', () => {
  it('should tell the frame the sidebar is open when the site opens', () => {
    // Arrange
    const { frame, marks } = frameFake();

    // Act
    renderInDocs(layoutOn('index.md'), {
      frame,
    });

    // Assert
    expect([
      toggle().getAttribute('aria-expanded'),
      marks.at(-1),
    ]).toStrictEqual([
      'true',
      FrameMark.Open,
    ]);
  });

  it('should tell the frame when the reader collapses the sidebar', async () => {
    // Arrange
    const { frame, marks } = frameFake();

    renderInDocs(layoutOn('index.md'), {
      frame,
    });

    // Act
    await userEvent.click(toggle());

    // Assert
    expect(marks.at(-1)).toBe(FrameMark.Collapsed);
  });

  it('should show the page tree when the root gives no frame', () => {
    // Arrange
    const path = 'index.md';

    // Act
    renderInDocs(layoutOn(path));

    // Assert
    expect(
      screen
        .getByRole('link', {
          name: 'Write a pack',
        })
        .getAttribute('href'),
    ).toBe('/docs/guides/write-a-pack');
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderInDocs(layoutOn('index.md'), {
      frame: frameFake().frame,
    });

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
