import { describe, expect, it } from 'bun:test';

import { buildAppCss, undefinedReadsOf } from './app-css.fixtures';

describe('app.css', () => {
  it('should declare every custom property it reads without a fallback, save those a script sets', async () => {
    // Act
    const css = await buildAppCss();

    // Assert
    expect(undefinedReadsOf(css)).toStrictEqual([]);
  });
});
