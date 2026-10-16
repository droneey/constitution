import re
import tomllib
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
  from pathlib import Path

PYPROJECT = 'pyproject.toml'

type Homes = Mapping[str, tuple[str, ...]]


@dataclass(frozen=True, slots=True, kw_only=True)
class Settings:
  # each package with a home, by its import name, and the folders it is imported in
  homes: Homes = field(default_factory=dict)
  # the import names of the workspace's own units, which are the repository's code
  units: frozenset[str] = frozenset()


def _document(path: Path) -> dict[str, Any]:
  with path.open('rb') as file:
    return tomllib.load(file)


class SettingsError(ValueError):
  pass


def _folders(package: str, folders: object) -> tuple[str, ...]:
  names = (
    tuple(folder for folder in folders if isinstance(folder, str))
    if isinstance(folders, list)
    else ()
  )

  if not isinstance(folders, list) or len(names) != len(folders):
    message = f'the home of {package} is a list of folders, not {folders!r}'
    raise SettingsError(message)

  return names


def _homes_of(table: Mapping[str, Any]) -> dict[str, tuple[str, ...]]:
  return {package: _folders(package, folders) for package, folders in table.items()}


# The build backend names the import package after the distribution.
def _import_name(distribution: str) -> str:
  return re.sub(r'[-.]+', '_', distribution).lower()


# The project's pyproject.toml names the parts that give packages their homes,
# in `[tool.python-check]`, and may add homes of its own; its workspace sources
# name the units that are the repository's own code.
def settings_of(folder: Path) -> Settings:
  path = folder / PYPROJECT

  if not path.is_file():
    return Settings()

  tool = _document(path).get('tool', {})
  own = tool.get('python-check', {})
  homes: dict[str, tuple[str, ...]] = {}

  for part in own.get('extend', []):
    homes |= _homes_of(_document(folder / part).get('homes', {}))

  units = frozenset(
    _import_name(name)
    for name, source in tool.get('uv', {}).get('sources', {}).items()
    if isinstance(source, dict) and source.get('workspace') is True
  )

  return Settings(homes=homes | _homes_of(own.get('homes', {})), units=units)
