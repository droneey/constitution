import { afterEach, describe, expect, it } from 'bun:test';

import { documentFrame } from '../document-frame.adapter';

declare global {
  var happyDOM: {
    setViewport: (viewport: { width: number }) => void;
  };
}

const wideWidth = globalThis.innerWidth;

/** in CSS pixels */
const viewportOf = (width: number): void => {
  globalThis.happyDOM.setViewport({
    width,
  });
};

afterEach(() => {
  viewportOf(wideWidth);

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
  ])('should call a $width px screen narrow: $narrow', ({ narrow, width }) => {
    // Arrange
    viewportOf(width);

    // Act
    const isNarrow = documentFrame.isNarrow();

    // Assert
    expect(isNarrow).toBe(narrow);
  });

  it('should set the document data-sidebar to collapsed when it marks the sidebar collapsed', () => {
    // Arrange
    const root = document.documentElement;

    // Act
    documentFrame.markSidebarCollapsed();

    // Assert
    expect(root.dataset.sidebar).toBe('collapsed');
  });

  it('should set the document data-sidebar to open when it marks the sidebar open', () => {
    // Arrange
    const root = document.documentElement;

    // Act
    documentFrame.markSidebarOpen();

    // Assert
    expect(root.dataset.sidebar).toBe('open');
  });
});
