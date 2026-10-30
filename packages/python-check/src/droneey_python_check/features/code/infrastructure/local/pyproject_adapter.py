import re
import tomllib
from dataclasses import dataclass
from typing import TYPE_CHECKING, Final, TypeIs

from ...domain.settings.constants import WHOLE_EDGE_WORD
from ...domain.settings.entities import HomePlace, Settings, TopLevelFolder, WholeEdge
from ...domain.settings.errors import (
  Expected,
  MalformedFile,
  MissingPart,
  Problem,
  SettingsError,
  UnknownKey,
  WrongShape,
)
from ...domain.shared.entities import Layer

if TYPE_CHECKING:
  from collections.abc import Callable, Mapping
  from pathlib import Path

PYPROJECT_FILE_NAME: Final = 'pyproject.toml'
TOOL_KEY: Final = 'tool'
OWN_TABLE_KEY: Final = 'python-check'
EXTEND_KEY: Final = 'extend'
HOMES_KEY: Final = 'homes'
UV_KEY: Final = 'uv'
SOURCES_KEY: Final = 'sources'
WORKSPACE_KEY: Final = 'workspace'
OWN_TABLE_KEYS: Final = frozenset({EXTEND_KEY, HOMES_KEY})
PART_KEYS: Final = frozenset({HOMES_KEY})


def _toml_document(*, folder_path: Path, path_from_unit: str) -> Mapping[str, object] | None:
  """The file's TOML document, or None when no file is there.

  Raises:
    SettingsError: the file does not parse as TOML.
  """
  absolute_path = folder_path / path_from_unit

  if not absolute_path.is_file():
    return None

  with absolute_path.open('rb') as toml_file:
    try:
      return tomllib.load(toml_file)
    except tomllib.TOMLDecodeError as error:
      parser_message = str(error)  # pragma: no mutate -- the parser's text only a person reads
      problem = MalformedFile(path_from_unit=path_from_unit, parser_message=parser_message)

      raise SettingsError((problem,)) from error


def _is_table(candidate: object) -> TypeIs[Mapping[str, object]]:
  return isinstance(candidate, dict) and all(isinstance(key, str) for key in candidate)


def _is_list_of_text(candidate: object) -> TypeIs[list[str]]:
  return isinstance(candidate, list) and all(isinstance(entry, str) for entry in candidate)


def _dotted_key(*keys: str) -> str:
  return '.'.join(keys)


def _home_place(word: str) -> HomePlace:
  if word == WHOLE_EDGE_WORD:
    return WholeEdge()

  return Layer(word) if word in Layer else TopLevelFolder(name=word)


@dataclass(frozen=True, slots=True, kw_only=True)
class _Read[T]:
  value: T
  problems: tuple[Problem, ...] = ()


@dataclass(frozen=True, slots=True, kw_only=True)
class _File:
  path_from_unit: str

  def table(
    self, parent: Mapping[str, object], *, key: str, dotted_key: str
  ) -> _Read[Mapping[str, object]]:
    candidate = parent.get(key, {})

    if _is_table(candidate):
      return _Read(value=candidate)

    problem = WrongShape(
      path_from_unit=self.path_from_unit, dotted_key=dotted_key, expected=Expected.TABLE
    )

    return _Read(value={}, problems=(problem,))

  def unknown_keys(
    self, table: Mapping[str, object], *, known_keys: frozenset[str], keys_to_table: tuple[str, ...]
  ) -> tuple[Problem, ...]:
    return tuple(
      UnknownKey(path_from_unit=self.path_from_unit, dotted_key=_dotted_key(*keys_to_table, key))
      for key in table
      if key not in known_keys
    )

  def homes(
    self, parent: Mapping[str, object], *, dotted_key: str
  ) -> _Read[dict[str, tuple[HomePlace, ...]]]:
    table = self.table(parent, key=HOMES_KEY, dotted_key=dotted_key)
    entries = table.value.items()

    return _Read(
      value={
        package_name: tuple(_home_place(word) for word in words)
        for package_name, words in entries
        if _is_list_of_text(words)
      },
      problems=table.problems
      + tuple(
        WrongShape(
          path_from_unit=self.path_from_unit,
          dotted_key=_dotted_key(dotted_key, package_name),
          expected=Expected.LIST_OF_TEXT,
        )
        for package_name, words in entries
        if not _is_list_of_text(words)
      ),
    )


# Why: the build backend names the import package after the distribution.
def _import_name(distribution_name: str) -> str:
  return re.sub(r'[-.]+', '_', distribution_name).lower()


def _unit_import_names(uv_sources: Mapping[str, object]) -> frozenset[str]:
  return frozenset(
    _import_name(distribution_name)
    for distribution_name, uv_source in uv_sources.items()
    if _is_table(uv_source) and uv_source.get(WORKSPACE_KEY) is True
  )


def _part_homes(
  part_path: str, part: Mapping[str, object] | None
) -> _Read[dict[str, tuple[HomePlace, ...]]]:
  if part is None:
    return _Read(value={}, problems=(MissingPart(path_from_unit=part_path),))

  part_file = _File(path_from_unit=part_path)
  homes = part_file.homes(part, dotted_key=HOMES_KEY)

  return _Read(
    value=homes.value,
    problems=part_file.unknown_keys(part, known_keys=PART_KEYS, keys_to_table=()) + homes.problems,
  )


def _part_paths(own_table: Mapping[str, object]) -> _Read[tuple[str, ...]]:
  part_paths = own_table.get(EXTEND_KEY, [])

  if _is_list_of_text(part_paths):
    return _Read(value=tuple(part_paths))

  problem = WrongShape(
    path_from_unit=PYPROJECT_FILE_NAME,
    dotted_key=_dotted_key(TOOL_KEY, OWN_TABLE_KEY, EXTEND_KEY),
    expected=Expected.LIST_OF_TEXT,
  )

  return _Read(value=(), problems=(problem,))


def _settings_of(
  *,
  pyproject: Mapping[str, object] | None,
  read_part: Callable[[str], Mapping[str, object] | None],
) -> Settings:
  """Parses the settings of pyproject.toml and of each part it extends.

  Raises:
    SettingsError: with every problem of their shapes, each by its file and key.
  """
  pyproject_file = _File(path_from_unit=PYPROJECT_FILE_NAME)
  own_dotted_key = _dotted_key(TOOL_KEY, OWN_TABLE_KEY)
  tool_table = pyproject_file.table(pyproject or {}, key=TOOL_KEY, dotted_key=TOOL_KEY)
  own_table = pyproject_file.table(tool_table.value, key=OWN_TABLE_KEY, dotted_key=own_dotted_key)
  part_paths = _part_paths(own_table.value)
  part_homes = tuple(_part_homes(part_path, read_part(part_path)) for part_path in part_paths.value)
  own_homes = pyproject_file.homes(
    own_table.value, dotted_key=_dotted_key(own_dotted_key, HOMES_KEY)
  )
  uv_dotted_key = _dotted_key(TOOL_KEY, UV_KEY)
  uv_table = pyproject_file.table(tool_table.value, key=UV_KEY, dotted_key=uv_dotted_key)
  uv_sources = pyproject_file.table(
    uv_table.value, key=SOURCES_KEY, dotted_key=_dotted_key(uv_dotted_key, SOURCES_KEY)
  )
  problems = (
    tool_table.problems
    + own_table.problems
    + pyproject_file.unknown_keys(
      own_table.value, known_keys=OWN_TABLE_KEYS, keys_to_table=(TOOL_KEY, OWN_TABLE_KEY)
    )
    + part_paths.problems
    + tuple(problem for homes in part_homes for problem in homes.problems)
    + own_homes.problems
    + uv_table.problems
    + uv_sources.problems
  )

  if problems:
    raise SettingsError(problems)

  return Settings(
    homes_by_import_name={
      package_name: home_places
      for homes in (*part_homes, own_homes)
      for package_name, home_places in homes.value.items()
    },
    workspace_unit_import_names=_unit_import_names(uv_sources.value),
  )


def read_settings(unit_path: Path) -> Settings:
  """The settings of the unit's pyproject.toml and of each part it extends.

  Raises:
    SettingsError: with every problem of their shapes, or a file that does not parse as TOML.
  """
  return _settings_of(
    pyproject=_toml_document(folder_path=unit_path, path_from_unit=PYPROJECT_FILE_NAME),
    read_part=lambda part_path: _toml_document(folder_path=unit_path, path_from_unit=part_path),
  )
