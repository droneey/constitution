from typing import TYPE_CHECKING

from droneey_python_check.features.code.domain.types import PackagePath

if TYPE_CHECKING:
  from pathlib import Path


def python(*lines: str) -> str:
  return ''.join(f'{line}\n' for line in lines)


def function_of(line_count: int) -> str:
  return python('def tally() -> int:', *['  total = 0'] * (line_count - 2), '  return total')


def write_files(folder_path: Path, texts: dict[str, str]) -> None:
  for file_path, text in texts.items():
    absolute_path = folder_path / file_path
    absolute_path.parent.mkdir(parents=True, exist_ok=True)
    absolute_path.write_text(text, encoding='utf-8')


def folder(text: str) -> PackagePath:
  return PackagePath(tuple(text.split('/')) if text else ())


def table_function_of(line_count: int) -> str:
  return python('def table() -> list[int]:', '  return [', *['    0,'] * (line_count - 3), '  ]')


def lifted(source: str, *, reason: str = 'a table') -> str:
  """The source with its first `def` line lifting the function's limit by the reason."""
  return source.replace(':\n', f':  # python-check: ignore[function-lines] -- {reason}\n', 1)
