import { afterEach, describe, expect, test } from 'bun:test';

import { cleanup, render } from '@testing-library/react';

import { DocsRepositoryIcon } from '../docs-repository-icon';

afterEach(cleanup);

describe('DocsRepositoryIcon', () => {
  test('should draw the mark hidden from assistive technology, since its link carries the name', () => {
    // Arrange
    const icon = <DocsRepositoryIcon />;

    // Act
    const { container } = render(icon);

    // Assert
    // biome-ignore lint/plugin/queries-by-role-label-text: the mark is an image hidden from assistive technology, which no role, label or text names
    expect(container.querySelector('svg[aria-hidden="true"] > path') === null).toBe(false);
  });
});
