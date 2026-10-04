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
const PYDANTIC_TWO_FORMS = model(
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
const validated = (input: { decorator: string; name: string; body: readonly string[] }): string =>
  python(
    `from pydantic import BaseModel, ${input.name}`,
    '',
    '',
    'class Order(BaseModel):',
    '  id: str',
    '',
    `  @${input.decorator}`,
    '  @classmethod',
    ...input.body,
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

describe("the ty preset's hold on pydantic", () => {
  it("should pass a model written in pydantic 2's forms", () => {
    // Arrange
    const source = PYDANTIC_TWO_FORMS;

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
    {
      form: 'json()',
      source: model('def dump(order: Order) -> str:', '  return order.json()'),
    },
    {
      form: 'copy()',
      source: model('def clone(order: Order) -> Order:', '  return order.copy()'),
    },
    {
      form: 'parse_obj',
      source: model('def parse(raw: dict[str, str]) -> Order:', '  return Order.parse_obj(raw)'),
    },
    {
      form: 'parse_raw',
      source: model('def parse(text: str) -> Order:', '  return Order.parse_raw(text)'),
    },
    {
      form: 'validator',
      source: validated({
        body: [
          '  def checked(cls, value: str) -> str:',
          '    return value',
        ],
        decorator: "validator('id')",
        name: 'validator',
      }),
    },
    {
      form: 'root_validator',
      source: validated({
        body: [
          '  def checked(cls, values: dict[str, str]) -> dict[str, str]:',
          '    return values',
        ],
        decorator: 'root_validator(skip_on_failure=True)',
        name: 'root_validator',
      }),
    },
  ])('should fail the check with deprecated when a model uses $form', ({ source }) => {
    // Arrange
    const code = source;

    // Act
    const check = typeCheck(code);

    // Assert
    expect(check).toStrictEqual({
      isClean: false,
      rules: [
        'deprecated',
      ],
    });
  });
});
