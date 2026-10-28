import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';

import { frameOf, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { FailureBlock } from '../failure-block';

describe('FailureBlock', () => {
  it('should draw what happened, what is known and what to do next, and read out that it is an error, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'a failure that names a next step': frameOf(
        <FailureBlock
          errorLabel='error'
          failure={{
            details: [
              'constitution.yaml',
            ],
            hint: 'init',
            title: 'no-project',
          }}
        />,
      ),
      'a failure that names none': frameOf(
        <FailureBlock
          errorLabel='error'
          failure={{
            details: [],
            title: 'Interrupted',
          }}
        />,
      ),
      'read out': screenReaderOutputOf(
        <FailureBlock
          errorLabel='error'
          failure={{
            details: [],
            title: 'no-project',
          }}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('failure-block.golden.txt', import.meta.url)));
  });
});
