import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';

import { frameOf, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { ProgressBar } from '../progress-bar';

const quarter = {
  done: 1,
  label: 'Files',
  total: 4,
};

describe('ProgressBar', () => {
  it('should draw the bar of the share, the count and the percentage, and read out the count without the bar, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'a quarter done': frameOf(<ProgressBar progress={quarter} />),
      'read out': screenReaderOutputOf(<ProgressBar progress={quarter} />),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('progress-bar.golden.txt', import.meta.url)));
  });
});
