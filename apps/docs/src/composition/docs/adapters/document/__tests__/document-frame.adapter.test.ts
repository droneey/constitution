import { afterEach, describe, expect, test } from 'bun:test';

import { documentFrame } from '../document-frame.adapter';

declare global {
  /** the simulated browser the specs run in, which sizes its window on request */
  var happyDOM: {
    setViewport: (viewport: { width: number }) => void;
  };
}

const WIDE = globalThis.innerWidth;

/** the browser's window at this width, in CSS pixels */
const viewportOf = (width: number): void => {
  globalThis.happyDOM.setViewport({
    width,
  });
};

afterEach(() => {
  viewportOf(WIDE);
  delete document.documentElement.dataset.sidebar;
});

describe('documentFrame', () => {
  test.each([
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

  test.each([
    {
      collapsed: true,
      state: 'collapsed',
    },
    {
      collapsed: false,
      state: 'open',
    },
  ])(
    'should set the document data-sidebar to $state when the sidebar collapsed is $collapsed',
    ({ collapsed, state }) => {
      // Arrange
      const root = document.documentElement;

      // Act
      documentFrame.markSidebar(collapsed);

      // Assert
      expect(root.dataset.sidebar).toBe(state);
    },
  );
});
