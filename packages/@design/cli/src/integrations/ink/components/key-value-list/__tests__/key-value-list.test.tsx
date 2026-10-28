import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { createMarkingTheme, markedSpansOf } from '#/__tests__/theme.fixtures';

import { frameOf } from '../../../__tests__/ink.fixtures';
import { KeyValueList } from '../key-value-list';

describe('KeyValueList', () => {
  it('should line up the values after the widest key, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'keys of two widths': frameOf(
        <KeyValueList
          pairs={[
            [
              'version',
              '0.80.0',
            ],
            [
              'blocks',
              '18',
            ],
          ]}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('key-value-list.golden.txt', import.meta.url)),
    );
  });

  it('should draw the keys in the muted tone', () => {
    // Arrange
    const theme = createMarkingTheme();

    // Act
    const frame = frameOf(
      <KeyValueList
        pairs={[
          [
            'version',
            '1',
          ],
        ]}
      />,
      theme,
    );

    // Assert
    expect(markedSpansOf(frame)).toStrictEqual([
      [
        'muted',
        'version',
      ],
    ]);
  });
});
