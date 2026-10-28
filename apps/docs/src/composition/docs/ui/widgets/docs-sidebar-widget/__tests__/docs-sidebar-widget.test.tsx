import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocsLayout, Sidebar } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { pageTreeFixture, renderInDocs } from '../../../../__tests__/docs.fixtures';
import { frameFake } from '../../../../__tests__/docs-frame.fake';
import { DocsLocationContext } from '../../../../app/providers';
import { SidebarState } from '../../../../domain/entities';
import { DocsNavTitle, repositoryLink } from '../../../components';
import { DocsSidebarWidget } from '../docs-sidebar-widget';

afterEach(cleanup);

const sidebar = {
  drawer: (): undefined => undefined,
  main: DocsSidebarWidget,
  provider: Sidebar.Provider,
};

const overviewLayout = (): ReactElement => (
  <DocsLocationContext
    value={{
      href: '/docs',
    }}
  >
    <DocsLayout
      links={[
        repositoryLink,
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
  it('should tell the frame the sidebar is open when the site opens', async () => {
    // Arrange
    const { frame, marks } = frameFake();

    // Act
    await renderInDocs(overviewLayout(), {
      frame,
    });

    // Assert
    expect([
      toggle().getAttribute('aria-expanded'),
      marks.at(-1),
    ]).toStrictEqual([
      'true',
      SidebarState.Open,
    ]);
  });

  it('should tell the frame when the reader collapses the sidebar', async () => {
    // Arrange
    const { frame, marks } = frameFake();

    await renderInDocs(overviewLayout(), {
      frame,
    });

    // Act
    await userEvent.click(toggle());

    // Assert
    expect(marks.at(-1)).toBe(SidebarState.Collapsed);
  });

  it('should show the page tree when the root gives no frame', async () => {
    // Act
    await renderInDocs(overviewLayout());

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
    await renderInDocs(overviewLayout(), {
      frame: frameFake().frame,
    });

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
