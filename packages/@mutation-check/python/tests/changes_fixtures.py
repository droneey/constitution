from pathlib import PurePosixPath
from typing import TYPE_CHECKING, Final

from droneey_mutation_check_python.features.mutation.domain.entities import ChangedFile, NewFile
from droneey_mutation_check_python.features.mutation.domain.value_objects import UnitRelativePath

if TYPE_CHECKING:
  from collections.abc import Mapping


def python(*lines: str) -> str:
  return ''.join(f'{line}\n' for line in lines)


SHOP_PACKAGE_TEXTS: Final[Mapping[str, str]] = {
  'src/shop/__init__.py': python('def version() -> str:', "  return '1'"),
  'src/shop/orders.py': python(
    'LIMIT = 10',
    '',
    '',
    'def total(prices: list[int]) -> int:',
    '  return sum(prices)',
    '',
    '',
    '@staticmethod',
    'def discount(price: int) -> int:',
    '  return price // 2',
    '',
    '',
    'class Basket:',
    '  size = 0',
    '',
    '  async def add(self, price: int) -> int:',
    '    return price',
  ),
  'src/shop/kernel/__init__.py': python('def zero() -> int:', '  return 0'),
  'src/shop/kernel/money.py': python('def cents(amount: int) -> int:', '  return amount * 100'),
}


def unit_relative_path(text: str) -> UnitRelativePath:
  return UnitRelativePath(path=PurePosixPath(text))


def changed(path: str, *line_ranges: range) -> ChangedFile:
  return ChangedFile(path=unit_relative_path(path), line_ranges=line_ranges)


def new(path: str) -> NewFile:
  return NewFile(path=unit_relative_path(path))
