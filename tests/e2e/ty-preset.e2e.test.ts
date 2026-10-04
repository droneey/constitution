import { describe, expect, it } from 'bun:test';

import { typeCheck } from './ty-preset.fixtures';

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

const WELL_TYPED = python(
  'from typing import override',
  '',
  '',
  'class Order:',
  '  def total(self) -> int:',
  '    return 0',
  '',
  '',
  'class PaidOrder(Order):',
  '  @override',
  '  def total(self) -> int:',
  '    return 1',
  '',
  '',
  'async def fetch(ids: list[int]) -> int:',
  '  return len(ids)',
  '',
  '',
  'async def count() -> int:',
  '  return await fetch([1])',
);
const OVERRIDE_UNMARKED = python(
  'class Order:',
  '  def total(self) -> int:',
  '    return 0',
  '',
  '',
  'class PaidOrder(Order):',
  '  def total(self) -> int:',
  '    return 1',
);
const COROUTINE_DROPPED = python(
  'async def fetch() -> int:',
  '  return 1',
  '',
  '',
  'async def refresh() -> None:',
  '  fetch()',
);
const BARE_GENERIC = python('IDS: list = []');
const BLANKET_IGNORE = python("LIMIT: int = 'ten'  # ty: ignore");
const UNUSED_IGNORE = python('LIMIT: int = 10  # ty: ignore[invalid-assignment]');
const TYPE_IGNORE = python("LIMIT: int = 'ten'  # type: ignore[assignment]");
const REDUNDANT_CAST = python(
  'from typing import cast',
  '',
  '',
  'def limit(count: int) -> int:',
  '  return cast(int, count)',
);

describe('the ty preset', () => {
  it('should pass well-typed code when the check runs with the part', () => {
    // Arrange
    const source = WELL_TYPED;

    // Act
    const check = typeCheck(source);

    // Assert
    expect(check).toStrictEqual({
      isClean: true,
      rules: [],
    });
  });

  it.each([
    {
      condition: 'an override is not marked',
      rule: 'missing-override-decorator',
      source: OVERRIDE_UNMARKED,
    },
    {
      condition: 'a coroutine is dropped without being awaited',
      rule: 'unused-awaitable',
      source: COROUTINE_DROPPED,
    },
    {
      condition: 'a generic is written without its arguments',
      rule: 'missing-type-argument',
      source: BARE_GENERIC,
    },
    {
      condition: 'a ty: ignore names no rule',
      rule: 'blanket-ignore-comment',
      source: BLANKET_IGNORE,
    },
    {
      condition: 'a ty: ignore silences nothing',
      rule: 'unused-ignore-comment',
      source: UNUSED_IGNORE,
    },
    {
      condition: 'a type: ignore stands over a wrong assignment',
      rule: 'invalid-assignment',
      source: TYPE_IGNORE,
    },
    {
      condition: 'a cast changes nothing, which ty only warns of by default',
      rule: 'redundant-cast',
      source: REDUNDANT_CAST,
    },
  ])('should fail the check with $rule when $condition', ({ rule, source }) => {
    // Arrange
    const code = source;

    // Act
    const check = typeCheck(code);

    // Assert
    expect(check).toStrictEqual({
      isClean: false,
      rules: [
        rule,
      ],
    });
  });
});
