import { describe, expect, it } from 'bun:test';

import { isFormatted, lintCodes } from './ruff-preset.fixtures';

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

const WELL_FORMED = python(
  '"""Orders and their totals."""',
  '',
  'from datetime import UTC, datetime',
  '',
  '',
  'def total(prices: list[int], *, discount: int) -> int:',
  '  return max(sum(prices) - discount, 0)',
  '',
  '',
  'def stamp(label: str) -> str:',
  "  return f'{label} {datetime.now(tz=UTC).isoformat()}'",
);
const DEBUG_PRINT = python('def show(label: str) -> None:', '  print(label)');
const BREAKPOINT = python('def show(label: str) -> None:', '  breakpoint()', '  _ = label');
const FOUR_POSITIONAL = python(
  'def total(price: int, count: int, tax: int, fee: int) -> int:',
  '  return price * count + tax + fee',
);
const UNUSED_ARGUMENT = python('def total(price: int, count: int) -> int:', '  return price');
const UNUSED_IMPORT = python('import os');
const CAUSE_DROPPED = python(
  'class OrderNotFoundError(Exception):',
  '  pass',
  '',
  '',
  'def order_id(text: str) -> int:',
  '  try:',
  '    return int(text)',
  '  except ValueError:',
  '    raise OrderNotFoundError',
);
const UNANNOTATED = python('def total(prices):', '  return sum(prices)');
const NAIVE_NOW = python(
  'from datetime import datetime',
  '',
  '',
  'def stamp() -> str:',
  '  return datetime.now().isoformat()',
);
const SYS_PATH = python('import sys', '', "sys.path.append('lib')");
const EXCEPT_PASS = python(
  'def order_id(text: str) -> int:',
  '  try:',
  '    return int(text)',
  '  except ValueError:',
  '    pass',
  '  return 0',
);
const TYPE_VAR_CLASS = python(
  'from typing import Generic, TypeVar',
  '',
  "T = TypeVar('T')",
  '',
  '',
  'class Box(Generic[T]):',
  '  def __init__(self, item: T) -> None:',
  '    self.item = item',
);
const BLANKET_NOQA = python('import os  # noqa');
const UNUSED_NOQA = python('LIMIT = 10  # noqa: E501 -- the line is short');
const TODO_WITH_ISSUE = python('# TODO(#12): round each line', 'LIMIT = 10');
const DOUBLE_QUOTES = python('LABEL = "orders"');
const spec = (...lines: readonly string[]): string => python('import pytest', '', '', ...lines);
const SKIP_MARK = spec(
  "@pytest.mark.skip(reason='later')",
  'def test_should_count() -> None:',
  '  assert pytest',
);
const SKIP_IF_MARK = spec(
  "@pytest.mark.skipif(condition=True, reason='later')",
  'def test_should_count() -> None:',
  '  assert pytest',
);
const XFAIL_MARK = spec(
  '@pytest.mark.xfail',
  'def test_should_count() -> None:',
  '  assert pytest',
);
const SKIP_CALL = spec('def test_should_count() -> None:', "  pytest.skip('later')");
const XFAIL_CALL = spec('def test_should_count() -> None:', "  pytest.xfail('later')");
const IMPORT_OR_SKIP = spec(
  'def test_should_count() -> None:',
  "  assert pytest.importorskip('yaml')",
);
const FLAKY_MARK = spec(
  '@pytest.mark.flaky',
  'def test_should_count() -> None:',
  '  assert pytest',
);
const MOCK = python(
  'from unittest import mock',
  '',
  '',
  'def test_should_count() -> None:',
  '  assert mock',
);
const PYTEST_ASYNCIO = python(
  'import pytest_asyncio',
  '',
  '',
  'def test_should_count() -> None:',
  '  assert pytest_asyncio',
);
const BROAD_RAISES = spec(
  'def test_should_refuse() -> None:',
  '  with pytest.raises(ValueError):',
  "    int('ten')",
);
const route = (...lines: readonly string[]): string =>
  python(
    'from typing import Annotated',
    '',
    'from fastapi import FastAPI, Query',
    '',
    'app = FastAPI()',
    '',
    '',
    ...lines,
  );
const ANNOTATED_ROUTE = route(
  "@app.get('/orders/{order_id}')",
  'async def order(order_id: int, page: Annotated[int, Query()] = 1) -> int:',
  '  return order_id + page',
);
const DEFAULT_QUERY = python(
  'from fastapi import FastAPI, Query',
  '',
  'app = FastAPI()',
  '',
  '',
  "@app.get('/orders')",
  'async def orders(page: int = Query(1)) -> int:',
  '  return page',
);
const UNREAD_PATH_PARAMETER = route(
  "@app.get('/orders/{order_id}')",
  'async def order(page: Annotated[int, Query()] = 1) -> int:',
  '  return page',
);
const HTTP_EXCEPTION = python(
  'from fastapi import HTTPException',
  '',
  '',
  'def refuse() -> None:',
  '  raise HTTPException(status_code=404)',
);
const STARLETTE_EXCEPTION = python(
  'from starlette.exceptions import HTTPException',
  '',
  '',
  'def refuse() -> None:',
  '  raise HTTPException(status_code=404)',
);
const FOUR_SPACES = python('def total(prices: list[int]) -> int:', '    return sum(prices)');
const longCall = (width: number): string => {
  const head = 'TOTAL = sum(';
  const tail = ')';
  const items = Array.from(
    {
      length: width,
    },
    () => '1',
  ).join('');

  return python(`${head}[${items.slice(0, width - head.length - tail.length - 2)}]${tail}`);
};

describe('the ruff preset', () => {
  it.each([
    'fastapi',
  ])('should pass a well-formed module when a project extends %s', (part) => {
    // Arrange
    const project = {
      part,
      source: WELL_FORMED,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([]);
  });

  it.each([
    {
      code: 'F401',
      condition: 'an import is never used',
      part: 'core',
      source: UNUSED_IMPORT,
    },
    {
      code: 'B904',
      condition: 'an exception is raised in an except clause without its cause',
      part: 'core',
      source: CAUSE_DROPPED,
    },
    {
      code: 'ARG001',
      condition: 'a parameter is never read',
      part: 'core',
      source: UNUSED_ARGUMENT,
    },
    {
      code: 'T201',
      condition: 'shipped code prints',
      part: 'core',
      source: DEBUG_PRINT,
    },
    {
      code: 'T100',
      condition: 'shipped code stops at a breakpoint',
      part: 'core',
      source: BREAKPOINT,
    },
    {
      code: 'PLR0917',
      condition: 'a function takes four positional parameters',
      part: 'core',
      source: FOUR_POSITIONAL,
    },
    {
      code: 'ANN001',
      condition: 'a parameter is not annotated',
      part: 'python',
      source: UNANNOTATED,
    },
    {
      code: 'DTZ005',
      condition: 'a datetime is made without its time zone',
      part: 'python',
      source: NAIVE_NOW,
    },
    {
      code: 'TID251',
      condition: 'code changes sys.path',
      part: 'python',
      source: SYS_PATH,
    },
    {
      code: 'S110',
      condition: 'an except body only passes',
      part: 'python',
      source: EXCEPT_PASS,
    },
    {
      code: 'UP046',
      condition: 'a generic class is declared through TypeVar and Generic',
      part: 'python',
      source: TYPE_VAR_CLASS,
    },
    {
      code: 'PGH004',
      condition: 'a noqa names no code',
      part: 'self',
      source: BLANKET_NOQA,
    },
    {
      code: 'RUF100',
      condition: 'a noqa silences nothing',
      part: 'self',
      source: UNUSED_NOQA,
    },
  ])(
    'should report $code when $condition and a project extends $part',
    ({ code, part, source }) => {
      // Arrange
      const project = {
        part,
        source,
      };

      // Act
      const codes = lintCodes(project);

      // Assert
      expect(codes).toContain(code);
    },
  );

  it.each([
    {
      code: 'T201',
      condition: 'shipped code prints',
      part: 'self',
      source: DEBUG_PRINT,
    },
    {
      code: 'PLR0917',
      condition: 'a function takes four positional parameters',
      part: 'self',
      source: FOUR_POSITIONAL,
    },
    {
      code: 'ARG001',
      condition: 'a parameter is never read',
      part: 'self',
      source: UNUSED_ARGUMENT,
    },
    {
      code: 'ANN001',
      condition: 'a parameter is not annotated',
      part: 'core',
      source: UNANNOTATED,
    },
    {
      code: 'DTZ005',
      condition: 'a datetime is made without its time zone',
      part: 'core',
      source: NAIVE_NOW,
    },
    {
      code: 'TID251',
      condition: 'code changes sys.path',
      part: 'core',
      source: SYS_PATH,
    },
    {
      code: 'S110',
      condition: 'the except body of a named exception only passes',
      part: 'core',
      source: EXCEPT_PASS,
    },
    {
      code: 'TID251',
      condition: 'a spec is marked to be skipped',
      part: 'python',
      source: SKIP_MARK,
    },
    {
      code: 'PT011',
      condition: 'a spec expects a broad exception without a match',
      part: 'python',
      source: BROAD_RAISES,
    },
  ])(
    'should leave $code to a later part when $condition and a project extends only $part',
    ({ code, part, source }) => {
      // Arrange
      const project = {
        part,
        source,
      };

      // Act
      const codes = lintCodes(project);

      // Assert
      expect(codes).not.toContain(code);
    },
  );

  it('should accept a to-do that names its issue when a project extends python', () => {
    // Arrange
    const project = {
      part: 'python',
      source: TODO_WITH_ISSUE,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([]);
  });
});

describe("the ruff preset's part of pytest", () => {
  it.each([
    {
      condition: 'a spec is marked to be skipped',
      source: SKIP_MARK,
    },
    {
      condition: 'a spec is marked to be skipped under a condition',
      source: SKIP_IF_MARK,
    },
    {
      condition: 'a spec is marked to fail',
      source: XFAIL_MARK,
    },
    {
      condition: 'a spec skips itself',
      source: SKIP_CALL,
    },
    {
      condition: 'a spec marks itself as failing',
      source: XFAIL_CALL,
    },
    {
      condition: 'a spec skips itself when a module is missing',
      source: IMPORT_OR_SKIP,
    },
    {
      condition: 'a spec is marked to be run again',
      source: FLAKY_MARK,
    },
    {
      condition: 'a spec patches with unittest.mock',
      source: MOCK,
    },
    {
      condition: 'a spec imports pytest-asyncio',
      source: PYTEST_ASYNCIO,
    },
    {
      condition: "code changes sys.path, a ban of the python part's",
      source: SYS_PATH,
    },
  ])('should report TID251 when $condition', ({ source }) => {
    // Arrange
    const project = {
      part: 'pytest',
      source,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toContain('TID251');
  });

  it('should report PT011 when a spec expects a broad exception without a match', () => {
    // Arrange
    const project = {
      part: 'pytest',
      source: BROAD_RAISES,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([
      'PT011',
    ]);
  });
});

describe("the ruff preset's part of FastAPI", () => {
  it('should pass a route that declares its parameters in Annotated and reads its path', () => {
    // Arrange
    const project = {
      part: 'fastapi',
      source: ANNOTATED_ROUTE,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([]);
  });

  it.each([
    {
      code: 'FAST002',
      condition: "a parameter's source is its default value",
      source: DEFAULT_QUERY,
    },
    {
      code: 'FAST003',
      condition: 'the handler does not take a parameter of its path',
      source: UNREAD_PATH_PARAMETER,
    },
    {
      code: 'TID251',
      condition: "the program imports FastAPI's HTTPException",
      source: HTTP_EXCEPTION,
    },
    {
      code: 'TID251',
      condition: "the program imports Starlette's HTTPException",
      source: STARLETTE_EXCEPTION,
    },
    {
      code: 'TID251',
      condition: 'a spec patches with unittest.mock, which the part bans again',
      source: MOCK,
    },
    {
      code: 'TID251',
      condition: 'a spec is marked to be skipped, which the part bans again',
      source: SKIP_MARK,
    },
  ])('should report $code when $condition', ({ code, source }) => {
    // Arrange
    const project = {
      part: 'fastapi',
      source,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toContain(code);
  });

  it.each([
    {
      code: 'FAST002',
      source: DEFAULT_QUERY,
    },
    {
      code: 'TID251',
      source: HTTP_EXCEPTION,
    },
  ])(
    'should leave $code to the FastAPI part when a project extends only pytest',
    ({ code, source }) => {
      // Arrange
      const project = {
        part: 'pytest',
        source,
      };

      // Act
      const codes = lintCodes(project);

      // Assert
      expect(codes).not.toContain(code);
    },
  );
});

describe('the ruff formatter', () => {
  it.each([
    {
      condition: 'a module is written in single quotes and two spaces',
      isAccepted: true,
      source: WELL_FORMED,
    },
    {
      condition: 'a line is 100 characters long',
      isAccepted: true,
      source: longCall(100),
    },
    {
      condition: 'a line is 101 characters long',
      isAccepted: false,
      source: longCall(101),
    },
    {
      condition: 'a string is in double quotes',
      isAccepted: false,
      source: DOUBLE_QUOTES,
    },
    {
      condition: 'a block is indented by four spaces',
      isAccepted: false,
      source: FOUR_SPACES,
    },
  ])('should hold the layout of self when $condition', ({ isAccepted, source }) => {
    // Arrange
    const project = {
      part: 'self',
      source,
    };

    // Act
    const isClean = isFormatted(project);

    // Assert
    expect(isClean).toBe(isAccepted);
  });
});
