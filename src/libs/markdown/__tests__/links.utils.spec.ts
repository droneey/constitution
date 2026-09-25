import { describe, expect, it } from 'bun:test';

import { localLinkTargets } from '../links.utils';

describe('localLinkTargets', () => {
  it('should return local targets without their anchors', () => {
    // Act
    const targets = localLinkTargets(
      'See [a](../a.md#x), [b](https://b.dev), [c](#c) and [d](d.md).',
    );

    // Assert
    expect(targets).toStrictEqual([
      '../a.md',
      'd.md',
    ]);
  });
});
