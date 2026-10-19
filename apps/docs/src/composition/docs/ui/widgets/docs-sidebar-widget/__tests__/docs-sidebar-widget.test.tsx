import { afterEach, describe, expect, test } from 'bun:test';

import type { ReactElement } from 'react';

import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocsLayout, SidebarProvider } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { pageTreeFixture, renderInDocs } from '../../../../__tests__/docs.fixtures';
import { frameFake } from '../../../../__tests__/docs-frame.fake';
import { DocsLocationContext } from '../../../../app/providers';
import { layoutOptions } from '../../../constants';
import { DocsSidebarWidget } from '../docs-sidebar-widget';

afterEach(cleanup);

const sidebar = {
  drawer: (): undefined => undefined,
  main: DocsSidebarWidget,
  provider: SidebarProvider,
};

const layoutOn = (path: string): ReactElement => (
  <DocsLocationContext
    value={{
      href: `/docs/${path}`,
      path,
    }}
  >
    <DocsLayout
      {...layoutOptions}
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
  test('should keep the sidebar open and tell the frame so when the site opens on a wide screen', () => {
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
      false,
    ]);
  });

  test('should collapse the sidebar and tell the frame so when the site opens on a narrow screen', () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });

    // Act
    renderInDocs(layoutOn('index.md'), {
      frame,
    });

    // Assert
    expect([
      toggle().getAttribute('aria-expanded'),
      marks.at(-1),
    ]).toStrictEqual([
      'false',
      true,
    ]);
  });

  test('should collapse the sidebar again when the reader opens another page on a narrow screen', async () => {
    // Arrange
    const { frame, marks } = frameFake({
      narrow: true,
    });
    const { rerender } = renderInDocs(layoutOn('index.md'), {
      frame,
    });
    await userEvent.click(toggle());

    // Act
    rerender(layoutOn('guides/write-a-pack.md'));

    // Assert
    expect([
      toggle().getAttribute('aria-expanded'),
      marks.at(-1),
    ]).toStrictEqual([
      'false',
      true,
    ]);
  });

  test('should keep the sidebar open when the reader opens another page on a wide screen', () => {
    // Arrange
    const { frame, marks } = frameFake();
    const { rerender } = renderInDocs(layoutOn('index.md'), {
      frame,
    });

    // Act
    rerender(layoutOn('guides/write-a-pack.md'));

    // Assert
    expect([
      toggle().getAttribute('aria-expanded'),
      marks.at(-1),
    ]).toStrictEqual([
      'true',
      false,
    ]);
  });

  test('should tell the frame when the reader collapses the sidebar', async () => {
    // Arrange
    const { frame, marks } = frameFake();
    renderInDocs(layoutOn('index.md'), {
      frame,
    });

    // Act
    await userEvent.click(toggle());

    // Assert
    expect(marks.at(-1)).toBe(true);
  });

  test('should show the page tree when the root gives no frame', () => {
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

  test('should pass the WCAG 2.2 A and AA scan', async () => {
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
