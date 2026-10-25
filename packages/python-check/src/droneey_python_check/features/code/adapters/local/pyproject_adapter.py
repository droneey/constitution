import re
import tomllib
from dataclasses import dataclass
from typing import TYPE_CHECKING, Final, TypeIs

from ...domain.entities import Settings
from ...domain.errors import Expected, Problem, SettingsError

if TYPE_CHECKING:
  from collections.abc import Mapping
  from pathlib import Path

PYPROJECT: Final = 'pyproject.toml'


def toml_document(path: Path) -> Mapping[str, object] | None:
  if not path.is_file():
    return None

  with path.open('rb') as file:
    return tomllib.load(file)


def _is_table(value: object) -> TypeIs[Mapping[str, object]]:
  return isinstance(value, dict) and all(isinstance(key, str) for key in value)


def _is_texts(value: object) -> TypeIs[list[str]]:
  return isinstance(value, list) and all(isinstance(item, str) for item in value)


@dataclass(frozen=True, slots=True, kw_only=True)
class _Reader:
  file: str
  problems: list[Problem]

  def table(self, document: Mapping[str, object], key: str, *, path: str) -> Mapping[str, object]:
    value = document.get(key, {})

    if _is_table(value):
      return value

    self.problems.append(Problem(file=self.file, key=path, expected=Expected.TABLE))

    return {}

  def homes(self, table: Mapping[str, object], *, path: str) -> dict[str, tuple[str, ...]]:
    homes: dict[str, tuple[str, ...]] = {}

    for package, folders in table.items():
      if _is_texts(folders):
        homes[package] = tuple(folders)
      else:
        self.problems.append(
          Problem(file=self.file, key=f'{path}.{package}', expected=Expected.LIST_OF_TEXT)
        )

    return homes


def _own(document: Mapping[str, object]) -> Mapping[str, object]:
  tool = document.get('tool')
  own = tool.get('python-check') if _is_table(tool) else {}

  return own if _is_table(own) else {}


# The parts `extend` names, which the edge reads for `settings_of`, which reports a malformed one.
def extends_of(pyproject: Mapping[str, object] | None) -> tuple[str, ...]:
  extend = _own(pyproject or {}).get('extend')

  return tuple(extend) if _is_texts(extend) else ()


# The build backend names the import package after the distribution.
def _import_name(distribution: str) -> str:
  return re.sub(r'[-.]+', '_', distribution).lower()


def _units(sources: Mapping[str, object]) -> frozenset[str]:
  return frozenset(
    _import_name(name)
    for name, source in sources.items()
    if _is_table(source) and source.get('workspace') is True
  )


def settings_of(
  *, pyproject: Mapping[str, object] | None, parts: Mapping[str, Mapping[str, object] | None]
) -> Settings:
  """Parses the settings of pyproject.toml, absent when None, and of each part it extends.

  Raises:
    SettingsError: with every problem of their shapes, each by its file and key.
  """
  problems: list[Problem] = []
  project = _Reader(file=PYPROJECT, problems=problems)
  tool = project.table(pyproject or {}, 'tool', path='tool')
  own = project.table(tool, 'python-check', path='tool.python-check')
  homes: dict[str, tuple[str, ...]] = {}

  if not _is_texts(own.get('extend', [])):
    problems.append(
      Problem(file=PYPROJECT, key='tool.python-check.extend', expected=Expected.LIST_OF_TEXT)
    )

  for name, part in parts.items():
    reader = _Reader(file=name, problems=problems)

    if part is None:
      problems.append(Problem(file=name, key='', expected=Expected.FILE))
    else:
      homes |= reader.homes(reader.table(part, 'homes', path='homes'), path='homes')

  homes |= project.homes(
    project.table(own, 'homes', path='tool.python-check.homes'), path='tool.python-check.homes'
  )
  uv = project.table(tool, 'uv', path='tool.uv')
  units = _units(project.table(uv, 'sources', path='tool.uv.sources'))

  if problems:
    raise SettingsError(tuple(problems))

  return Settings(homes=homes, units=units)
