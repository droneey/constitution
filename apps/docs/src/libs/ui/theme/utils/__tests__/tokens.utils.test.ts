import { describe, expect, it } from 'bun:test';

import { collectTokens } from '../tokens.utils';

describe('collectTokens', () => {
  it('should list every token by its dotted path in the order of the source when groups nest', () => {
    // Arrange
    const group = {
      $description: 'The source.',
      size: {
        $type: 'dimension',
        control: {
          md: {
            $value: '{dimension.40}',
          },
        },
        header: {
          $value: '{dimension.56}',
        },
      },
      dimension: {
        '40': {
          $value: {
            unit: 'px',
            value: 40,
          },
        },
      },
    };

    // Act
    const tokens = collectTokens(group);

    // Assert
    expect([
      ...tokens,
    ]).toStrictEqual([
      [
        'size.control.md',
        {
          $value: '{dimension.40}',
        },
      ],
      [
        'size.header',
        {
          $value: '{dimension.56}',
        },
      ],
      [
        'dimension.40',
        {
          $value: {
            unit: 'px',
            value: 40,
          },
        },
      ],
    ]);
  });

  it('should leave a member out when its name starts with a dollar or it holds text', () => {
    // Arrange
    const group = {
      color: {
        $hidden: {
          $value: '{color.neutral.0}',
        },
        note: 'not a token',
        base: {
          $value: '{color.neutral.0}',
        },
      },
    };

    // Act
    const tokens = collectTokens(group);

    // Assert
    expect([
      ...tokens,
    ]).toStrictEqual([
      [
        'color.base',
        {
          $value: '{color.neutral.0}',
        },
      ],
    ]);
  });
});
