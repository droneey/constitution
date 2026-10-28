import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';

import { frameOf, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { Spinner } from '../spinner';

describe('Spinner', () => {
  it("should draw the step's symbol and the work going on when the theme holds still, and read it out without the spinner, as the golden file shows them", async () => {
    // Act
    const golden = goldenOf({
      'the theme holding still': frameOf(<Spinner label='lint' />),
      'read out': screenReaderOutputOf(<Spinner label='lint' />),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('spinner.golden.txt', import.meta.url)));
  });
});
