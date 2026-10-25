import { describe, expect, it } from 'bun:test';

import { ColourLevel } from '#/libs/ui';

import { createPlainOutput, renderWithTheme } from '../../../__tests__/ink.fixtures';
import { KeyValueList } from '../key-value-list';

describe('KeyValueList', () => {
  it('should line up the values after the widest key', () => {
    // Arrange
    const pairs = [
      [
        'version',
        '0.80.0',
      ],
      [
        'blocks',
        '18',
      ],
    ] as const;

    // Act
    const { lastFrame } = renderWithTheme(<KeyValueList pairs={pairs} />);

    // Assert
    expect(lastFrame()).toBe('version  0.80.0\nblocks   18');
  });

  it("should draw the keys in the muted tone's colour when the run shows colour", () => {
    // Arrange
    const output = createPlainOutput({
      colourLevel: ColourLevel.Basic,
    });

    // Act
    const { lastFrame } = renderWithTheme(
      <KeyValueList
        pairs={[
          [
            'version',
            '1',
          ],
        ]}
      />,
      output,
    );

    // Assert
    expect(lastFrame()).toBe('\u001B[37mversion\u001B[39m  1');
  });
});
