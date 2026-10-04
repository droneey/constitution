from collections.abc import Mapping
from pathlib import Path

from mutmut_check.targets import Changes


def python(*lines: str) -> str:
  return ''.join(f'{line}\n' for line in lines)


# A package of two modules and a class, laid out under src/ as mutmut reads it.
FILES: Mapping[str, str] = {
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


def changes_of(
  *,
  lines: Mapping[str, tuple[range, ...]] | None = None,
  untracked: tuple[str, ...] = (),
  extra: Mapping[str, str] | None = None,
) -> Changes:
  files = {**FILES, **(extra or {})}

  return Changes(
    lines={Path(path): ranges for path, ranges in (lines or {}).items()},
    untracked=tuple(Path(path) for path in untracked),
    sources=tuple(Path(path) for path in FILES),
    read=lambda path: files[str(path)],
  )
