import { describe, expect, it } from 'bun:test';

import { python } from './python-project.fixtures';
import { typeCheck } from './ty-preset.fixtures';

const wellTyped = python(
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
const overrideUnmarked = python(
  'class Order:',
  '  def total(self) -> int:',
  '    return 0',
  '',
  '',
  'class PaidOrder(Order):',
  '  def total(self) -> int:',
  '    return 1',
);
const coroutineDropped = python(
  'async def fetch() -> int:',
  '  return 1',
  '',
  '',
  'async def refresh() -> None:',
  '  fetch()',
);
const bareGeneric = python('IDS: list = []');
const blanketIgnore = python("LIMIT: int = 'ten'  # ty: ignore");
const typeIgnore = python("LIMIT: int = 'ten'  # type: ignore[assignment]");
const redundantCast = python(
  'from typing import cast',
  '',
  '',
  'def limit(count: int) -> int:',
  '  return cast(int, count)',
);

const model = (...lines: readonly string[]): string =>
  python(
    'from pydantic import BaseModel, ConfigDict',
    '',
    '',
    'class Order(BaseModel):',
    "  model_config = ConfigDict(extra='forbid', frozen=True)",
    '',
    '  id: str',
    '',
    '',
    ...lines,
  );

const pydanticTwoForms = model(
  'def dump(order: Order) -> str:',
  '  return order.model_dump_json()',
  '',
  '',
  'def parse(text: str) -> Order:',
  '  return Order.model_validate_json(text)',
  '',
  '',
  'def clone(order: Order) -> Order:',
  '  return order.model_copy()',
);

describe('the ty preset', () => {
  it('should pass well-typed code when the check runs with the part', () => {
    // Arrange
    const source = wellTyped;

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
      source: overrideUnmarked,
    },
    {
      condition: 'a coroutine is dropped without being awaited',
      rule: 'unused-awaitable',
      source: coroutineDropped,
    },
    {
      condition: 'a generic is written without its arguments',
      rule: 'missing-type-argument',
      source: bareGeneric,
    },
    {
      condition: 'a ty: ignore names no rule',
      rule: 'blanket-ignore-comment',
      source: blanketIgnore,
    },
    {
      condition: 'a type: ignore stands over a wrong assignment',
      rule: 'invalid-assignment',
      source: typeIgnore,
    },
    {
      condition: 'a cast changes nothing, which ty only warns of by default',
      rule: 'redundant-cast',
      source: redundantCast,
    },
  ])('should fail the check with $rule when $condition', ({ rule, source }) => {
    // Act
    const check = typeCheck(source);

    // Assert
    expect(check).toStrictEqual({
      isClean: false,
      rules: [
        rule,
      ],
    });
  });
});

describe("the ty preset's hold on pydantic", () => {
  it("should pass a model written in pydantic 2's forms", () => {
    // Arrange
    const source = pydanticTwoForms;

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
      form: 'dict()',
      source: model('def dump(order: Order) -> int:', '  return len(order.dict())'),
    },
  ])('should fail the check with deprecated when a model uses $form', ({ source }) => {
    // Act
    const check = typeCheck(source);

    // Assert
    expect(check).toStrictEqual({
      isClean: false,
      rules: [
        'deprecated',
      ],
    });
  });
});
