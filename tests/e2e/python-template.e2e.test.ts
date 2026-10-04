import { describe, expect, it } from 'bun:test';

import { checkTemplate } from './python-template.fixtures';

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

describe('the python template', () => {
  it('should pass the check when a module is formatted, linted and typed as the parts ask', () => {
    // Arrange
    const files = {
      'src/shop/orders.py': python(
        'def total(prices: list[int], *, discount: int) -> int:',
        '  return max(sum(prices) - discount, 0)',
      ),
    };

    // Act
    const isClean = checkTemplate(files);

    // Assert
    expect(isClean).toBe(true);
  });

  it.each([
    {
      condition: 'a module is laid out in four spaces',
      source: python(
        'def total(prices: list[int]) -> int:',
        '    return sum(prices)',
      ),
    },
    {
      condition: 'a parameter is not annotated',
      source: python('def total(prices) -> int:', '  return sum(prices)'),
    },
    {
      condition: 'a value is of the wrong type',
      source: python("LIMIT: int = 'ten'"),
    },
  ])('should fail the check when $condition', ({ source }) => {
    // Arrange
    const files = {
      'src/shop/orders.py': source,
    };

    // Act
    const isClean = checkTemplate(files);

    // Assert
    expect(isClean).toBe(false);
  });
});
