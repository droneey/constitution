import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { cleanup, screen } from '@testing-library/react';

import type { TocHeading } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { tocFixture } from '../../../../__tests__/docs.fixtures';
import type { ViewportFake } from '../../../../__tests__/intersection-observer.fake';
import { viewportFake } from '../../../../__tests__/intersection-observer.fake';
import { renderOnPage } from '../../../../__tests__/toc.fixtures';
import { DocsToc } from '../docs-toc';

let viewport: ViewportFake;

beforeEach(() => {
  viewport = viewportFake();
});

afterEach(() => {
  cleanup();
  viewport.restore();
});

describe('DocsToc', () => {
  test('should show no column when the page has no headings', () => {
    // Arrange
    const toc: TocHeading[] = [];

    // Act
    renderOnPage(<DocsToc />, toc);

    // Assert
    expect(
      screen.queryByRole('heading', {
        name: 'On this page',
      }),
    ).toBeNull();
  });

  test('should list the page headings under On this page when the page has headings', () => {
    // Arrange
    const toc = tocFixture();

    // Act
    renderOnPage(<DocsToc />, toc);

    // Assert
    expect([
      screen.getByRole('heading', {
        name: 'On this page',
      }).textContent,
      ...screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ]).toStrictEqual([
      'On this page',
      '#placement',
      '#layer',
      '#axis',
    ]);
  });

  test('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderOnPage(<DocsToc />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
