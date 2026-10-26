import { describe, expect, it } from 'bun:test';

import { python } from './python-project.fixtures';
import { isFormatted, lintCodes } from './ruff-preset.fixtures';

const wellFormed = python(
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
const debugPrint = python('def show(label: str) -> None:', '  print(label)');
const breakpoint = python('def show(label: str) -> None:', '  breakpoint()', '  _ = label');
const fourPositional = python(
  'def total(price: int, count: int, tax: int, fee: int) -> int:',
  '  return price * count + tax + fee',
);
const unusedArgument = python('def total(price: int, count: int) -> int:', '  return price');
const unusedImport = python('import os');
const causeDropped = python(
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
const unannotated = python('def total(prices):', '  return sum(prices)');
const naiveNow = python(
  'from datetime import datetime',
  '',
  '',
  'def stamp() -> str:',
  '  return datetime.now().isoformat()',
);
const sysPath = python('import sys', '', "sys.path.append('lib')");
const exceptPass = python(
  'def order_id(text: str) -> int:',
  '  try:',
  '    return int(text)',
  '  except ValueError:',
  '    pass',
  '  return 0',
);
const typeVarClass = python(
  'from typing import Generic, TypeVar',
  '',
  "T = TypeVar('T')",
  '',
  '',
  'class Box(Generic[T]):',
  '  def __init__(self, item: T) -> None:',
  '    self.item = item',
);
const blanketNoqa = python('import os  # noqa');
const unusedNoqa = python('LIMIT = 10  # noqa: E501 -- the line is short');
const todoWithIssue = python('# TODO(#12): round each line', 'LIMIT = 10');
const doubleQuotes = python('LABEL = "orders"');

const spec = (...lines: readonly string[]): string => python('import pytest', '', '', ...lines);

const skipMark = spec(
  "@pytest.mark.skip(reason='later')",
  'def test_should_count() -> None:',
  '  assert pytest',
);
const skipIfMark = spec(
  "@pytest.mark.skipif(condition=True, reason='later')",
  'def test_should_count() -> None:',
  '  assert pytest',
);
const xfailMark = spec('@pytest.mark.xfail', 'def test_should_count() -> None:', '  assert pytest');
const skipCall = spec('def test_should_count() -> None:', "  pytest.skip('later')");
const xfailCall = spec('def test_should_count() -> None:', "  pytest.xfail('later')");
const importOrSkip = spec(
  'def test_should_count() -> None:',
  "  assert pytest.importorskip('yaml')",
);
const flakyMark = spec('@pytest.mark.flaky', 'def test_should_count() -> None:', '  assert pytest');
const mock = python(
  'from unittest import mock',
  '',
  '',
  'def test_should_count() -> None:',
  '  assert mock',
);
const pytestAsyncio = python(
  'import pytest_asyncio',
  '',
  '',
  'def test_should_count() -> None:',
  '  assert pytest_asyncio',
);
const broadRaises = spec(
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

const annotatedRoute = route(
  "@app.get('/orders/{order_id}')",
  'async def order(order_id: int, page: Annotated[int, Query()] = 1) -> int:',
  '  return order_id + page',
);
const defaultQuery = python(
  'from fastapi import FastAPI, Query',
  '',
  'app = FastAPI()',
  '',
  '',
  "@app.get('/orders')",
  'async def orders(page: int = Query(1)) -> int:',
  '  return page',
);
const unreadPathParameter = route(
  "@app.get('/orders/{order_id}')",
  'async def order(page: Annotated[int, Query()] = 1) -> int:',
  '  return page',
);
const httpException = python(
  'from fastapi import HTTPException',
  '',
  '',
  'def refuse() -> None:',
  '  raise HTTPException(status_code=404)',
);
const starletteException = python(
  'from starlette.exceptions import HTTPException',
  '',
  '',
  'def refuse() -> None:',
  '  raise HTTPException(status_code=404)',
);
const bareNumber = python('def is_bulk(count: int) -> bool:', '  return count > 12');
const fourSpaces = python('def total(prices: list[int]) -> int:', '    return sum(prices)');

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

describe('the ruff preset file', () => {
  it.each([
    'fastapi',
  ])('should pass a well-formed module when a unit follows %s', (block) => {
    // Arrange
    const project = {
      blocks: [
        block,
      ],
      source: wellFormed,
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
      blocks: [],
      source: unusedImport,
    },
    {
      code: 'B904',
      condition: 'an exception is raised in an except clause without its cause',
      blocks: [],
      source: causeDropped,
    },
    {
      code: 'ARG001',
      condition: 'a parameter is never read',
      blocks: [],
      source: unusedArgument,
    },
    {
      code: 'T201',
      condition: 'shipped code prints',
      blocks: [],
      source: debugPrint,
    },
    {
      code: 'T100',
      condition: 'shipped code stops at a breakpoint',
      blocks: [],
      source: breakpoint,
    },
    {
      code: 'PLR0917',
      condition: 'a function takes four positional parameters',
      blocks: [],
      source: fourPositional,
    },
    {
      code: 'PLR2004',
      condition: 'a comparison names a bare number',
      blocks: [],
      source: bareNumber,
    },
    {
      code: 'ANN001',
      condition: 'a parameter is not annotated',
      blocks: [],
      source: unannotated,
    },
    {
      code: 'DTZ005',
      condition: 'a datetime is made without its time zone',
      blocks: [],
      source: naiveNow,
    },
    {
      code: 'TID251',
      condition: 'code changes sys.path',
      blocks: [],
      source: sysPath,
    },
    {
      code: 'S110',
      condition: 'an except body only passes',
      blocks: [],
      source: exceptPass,
    },
    {
      code: 'UP046',
      condition: 'a generic class is declared through TypeVar and Generic',
      blocks: [],
      source: typeVarClass,
    },
    {
      code: 'PGH004',
      condition: 'a noqa names no code',
      blocks: [],
      source: blanketNoqa,
    },
    {
      code: 'RUF100',
      condition: 'a noqa silences nothing',
      blocks: [],
      source: unusedNoqa,
    },
  ])('should report $code when $condition in a unit of Python', ({ blocks, code, source }) => {
    // Arrange
    const project = {
      blocks,
      source,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toContain(code);
  });

  it.each([
    {
      code: 'TID251',
      condition: 'a spec is marked to be skipped',
      blocks: [],
      source: skipMark,
    },
    {
      code: 'PT011',
      condition: 'a spec expects a broad exception without a match',
      blocks: [],
      source: broadRaises,
    },
  ])(
    'should leave $code to pytest when $condition and the unit follows no pytest',
    ({ code, blocks, source }) => {
      // Arrange
      const project = {
        blocks,
        source,
      };

      // Act
      const codes = lintCodes(project);

      // Assert
      expect(codes).not.toContain(code);
    },
  );

  it('should accept a to-do that names its issue in a unit of Python', () => {
    // Arrange
    const project = {
      blocks: [],
      source: todoWithIssue,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([]);
  });
});

describe('the ruff preset file of pytest', () => {
  it.each([
    {
      condition: 'a spec is marked to be skipped',
      source: skipMark,
    },
    {
      condition: 'a spec is marked to be skipped under a condition',
      source: skipIfMark,
    },
    {
      condition: 'a spec is marked to fail',
      source: xfailMark,
    },
    {
      condition: 'a spec skips itself',
      source: skipCall,
    },
    {
      condition: 'a spec marks itself as failing',
      source: xfailCall,
    },
    {
      condition: 'a spec skips itself when a module is missing',
      source: importOrSkip,
    },
    {
      condition: 'a spec is marked to be run again',
      source: flakyMark,
    },
    {
      condition: 'a spec patches with unittest.mock',
      source: mock,
    },
    {
      condition: 'a spec imports pytest-asyncio',
      source: pytestAsyncio,
    },
    {
      condition: 'code changes sys.path, a ban of the python block',
      source: sysPath,
    },
  ])('should report TID251 when $condition', ({ source }) => {
    // Arrange
    const project = {
      blocks: [
        'pytest',
      ],
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
      blocks: [
        'pytest',
      ],
      source: broadRaises,
    };

    // Act
    const codes = lintCodes(project);

    // Assert
    expect(codes).toStrictEqual([
      'PT011',
    ]);
  });
});

describe('the ruff preset file of FastAPI', () => {
  it('should pass a route that declares its parameters in Annotated and reads its path', () => {
    // Arrange
    const project = {
      blocks: [
        'fastapi',
      ],
      source: annotatedRoute,
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
      source: defaultQuery,
    },
    {
      code: 'FAST003',
      condition: 'the handler does not take a parameter of its path',
      source: unreadPathParameter,
    },
    {
      code: 'TID251',
      condition: "the program imports FastAPI's HTTPException",
      source: httpException,
    },
    {
      code: 'TID251',
      condition: "the program imports Starlette's HTTPException",
      source: starletteException,
    },
    {
      code: 'TID251',
      condition: 'a spec patches with unittest.mock, which the FastAPI preset file bans too',
      source: mock,
    },
    {
      code: 'TID251',
      condition: 'a spec is marked to be skipped, which the FastAPI preset file bans too',
      source: skipMark,
    },
  ])('should report $code when $condition', ({ code, source }) => {
    // Arrange
    const project = {
      blocks: [
        'fastapi',
      ],
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
      source: defaultQuery,
    },
    {
      code: 'TID251',
      source: httpException,
    },
  ])(
    'should leave $code to the FastAPI preset file when a unit follows only pytest',
    ({ code, source }) => {
      // Arrange
      const project = {
        blocks: [
          'pytest',
        ],
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
      source: wellFormed,
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
      source: doubleQuotes,
    },
    {
      condition: 'a block is indented by four spaces',
      isAccepted: false,
      source: fourSpaces,
    },
  ])('should hold its layout when $condition', ({ isAccepted, source }) => {
    // Arrange
    const project = {
      blocks: [],
      source,
    };

    // Act
    const isClean = isFormatted(project);

    // Assert
    expect(isClean).toBe(isAccepted);
  });
});
