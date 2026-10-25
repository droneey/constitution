import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { cleanup, screen } from '@testing-library/react';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { tocFixture } from '../../../../__tests__/docs.fixtures';
import type { ViewportFake } from '../../../../__tests__/intersection-observer.fake';
import { viewportFake } from '../../../../__tests__/intersection-observer.fake';
import { renderOnPage } from '../../../../__tests__/toc.fixtures';
import { DocsTocList } from '../docs-toc-list';

let viewport: ViewportFake;

beforeEach(() => {
  viewport = viewportFake();
});

afterEach(() => {
  cleanup();
  viewport.restore();
});

describe('DocsTocList', () => {
  it('should set sections at level 0 and the entries under them at level 1', () => {
    // Arrange
    const toc = tocFixture();

    // Act
    renderOnPage(<DocsTocList />, toc);

    // Assert
    expect(screen.getAllByRole('link').map((link) => link.dataset.level)).toStrictEqual([
      '0',
      '1',
      '1',
    ]);
  });

  it('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderOnPage(<DocsTocList />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
