import { afterEach, describe, expect, it } from 'bun:test';

import { keepOneLayout } from '#/libs/ui';

import { SidebarState } from '../../../domain/sidebar-state/entities';
import { documentFrame } from '../document-frame.adapter';

declare global {
  var happyDOM: {
    setViewport: (viewport: { width: number }) => void;
  };
}

const wideWidth = globalThis.innerWidth;

const pageMatchMedia = globalThis.matchMedia;

const viewportOf = (width: number): void => {
  globalThis.happyDOM.setViewport({
    width,
  });
};

afterEach(() => {
  viewportOf(wideWidth);

  globalThis.matchMedia = pageMatchMedia;

  delete document.documentElement.dataset.sidebar;
});

describe('documentFrame', () => {
  it.each([
    {
      narrow: true,
      width: 767,
    },
    {
      narrow: false,
      width: 768,
    },
  ])(
    'should call a $width px screen narrow: $narrow, while the site keeps one layout',
    ({ narrow, width }) => {
      // Arrange
      viewportOf(width);
      keepOneLayout();

      // Act
      const isNarrow = documentFrame.isNarrow();

      // Assert
      expect(isNarrow).toBe(narrow);
    },
  );

  it('should set the document data-sidebar to the state it marks the sidebar with', () => {
    // Act
    documentFrame.markSidebar(SidebarState.Collapsed);

    // Assert
    expect(document.documentElement.dataset.sidebar).toBe('collapsed');
  });
});
