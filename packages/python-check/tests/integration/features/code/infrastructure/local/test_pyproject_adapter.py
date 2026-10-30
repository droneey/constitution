import tomllib
from typing import TYPE_CHECKING, Final

import pytest
from hypothesis import given
from hypothesis import strategies as st
from source_fixtures import write_files

from droneey_python_check.features.code.domain.entities import (
  Layer,
  Settings,
  TopLevelFolder,
  WholeEdge,
)
from droneey_python_check.features.code.domain.errors import (
  Expected,
  MalformedFile,
  MissingPart,
  Problem,
  SettingsError,
  UnknownKey,
  WrongShape,
)
from droneey_python_check.features.code.infrastructure.local import read_settings

if TYPE_CHECKING:
  from pathlib import Path


@pytest.mark.parametrize(
  ('files', 'settings'),
  [
    pytest.param({}, Settings(), id='no pyproject'),
    pytest.param(
      {'pyproject.toml': '[project]\nname = "shop"\n[tool.uv]\nmanaged = true\n'},
      Settings(),
      id='a pyproject that names no home',
    ),
    pytest.param(
      {
        'pyproject.toml': (
          '[tool.python-check]\n'
          'extend = ["parts/pydantic.toml", "parts/structlog.toml"]\n'
          '[tool.python-check.homes]\n'
          'httpx = ["infrastructure", "reports"]\n'
        ),
        'parts/pydantic.toml': '[homes]\npydantic = ["edge", "shared"]\n',
        'parts/structlog.toml': '[homes]\nstructlog = ["root"]\nhttpx = ["infrastructure"]\n',
      },
      Settings(
        homes_by_import_name={
          'httpx': (Layer.INFRASTRUCTURE, TopLevelFolder(name='reports')),
          'pydantic': (WholeEdge(), TopLevelFolder(name='shared')),
          'structlog': (Layer.ROOT,),
        }
      ),
      id='the homes of the parts it extends, then its own',
    ),
    pytest.param(
      {
        'pyproject.toml': (
          '[tool.uv.sources]\n'
          '"Shop-Libs.Money" = { workspace = true }\n'
          'shop-shared = { workspace = true }\n'
          'vendored = { path = "../vendored" }\n'
          'pinned = { workspace = false }\n'
          'split = [{ index = "a", marker = "sys_platform == \'linux\'" }]\n'
        ),
      },
      Settings(workspace_unit_import_names=frozenset({'shop_libs_money', 'shop_shared'})),
      id='the units its workspace links',
    ),
  ],
)
def test_should_read_the_settings_of_the_unit(
  *, tmp_path: Path, files: dict[str, str], settings: Settings
) -> None:
  # Arrange
  write_files(tmp_path, files)

  # Act
  read = read_settings(tmp_path)

  # Assert
  assert read == settings


@pytest.mark.parametrize(
  ('pyproject', 'problem'),
  [
    pytest.param(
      'tool = 1\n',
      WrongShape(path_from_unit='pyproject.toml', dotted_key='tool', expected=Expected.TABLE),
      id='a tool of no table',
    ),
    pytest.param(
      'tool = { python-check = 1 }\n',
      WrongShape(
        path_from_unit='pyproject.toml', dotted_key='tool.python-check', expected=Expected.TABLE
      ),
      id='its own table of no table',
    ),
    pytest.param(
      '[tool.python-check]\nextend = "parts/a.toml"\n',
      WrongShape(
        path_from_unit='pyproject.toml',
        dotted_key='tool.python-check.extend',
        expected=Expected.LIST_OF_TEXT,
      ),
      id='an extend of no list',
    ),
    pytest.param(
      '[tool.python-check]\nhomes = 1\n',
      WrongShape(
        path_from_unit='pyproject.toml',
        dotted_key='tool.python-check.homes',
        expected=Expected.TABLE,
      ),
      id='homes of no table',
    ),
    pytest.param(
      '[tool.python-check]\nhome = { httpx = ["infrastructure"] }\n',
      UnknownKey(path_from_unit='pyproject.toml', dotted_key='tool.python-check.home'),
      id='a key its own table does not hold',
    ),
    pytest.param(
      '[tool.uv]\nsources = 1\n',
      WrongShape(
        path_from_unit='pyproject.toml', dotted_key='tool.uv.sources', expected=Expected.TABLE
      ),
      id='sources of no table',
    ),
  ],
)
def test_should_fail_by_the_key_when_a_table_of_the_pyproject_has_the_wrong_shape(
  *, tmp_path: Path, pyproject: str, problem: Problem
) -> None:
  # Arrange
  write_files(tmp_path, {'pyproject.toml': pyproject})

  # Act
  with pytest.raises(SettingsError) as raised:
    read_settings(tmp_path)

  # Assert
  assert raised.value.problems == (problem,)


def test_should_fail_with_every_problem_when_the_settings_have_the_wrong_shape(
  tmp_path: Path,
) -> None:
  # Arrange
  write_files(
    tmp_path,
    {
      'pyproject.toml': (
        '[tool]\n'
        'uv = 1\n'
        '[tool.python-check]\n'
        'extend = ["parts/missing.toml", "parts/flat.toml", "parts/bad.toml"]\n'
        '[tool.python-check.homes]\n'
        'pydantic = "edge"\n'
        'attrs = ["edge", 1]\n'
      ),
      'parts/flat.toml': 'homes = ["edge"]\n',
      'parts/bad.toml': 'extend = []\n[homes]\nhttpx = "infrastructure"\n',
    },
  )

  # Act
  with pytest.raises(SettingsError) as raised:
    read_settings(tmp_path)

  # Assert
  assert raised.value.problems == (
    MissingPart(path_from_unit='parts/missing.toml'),
    WrongShape(path_from_unit='parts/flat.toml', dotted_key='homes', expected=Expected.TABLE),
    UnknownKey(path_from_unit='parts/bad.toml', dotted_key='extend'),
    WrongShape(
      path_from_unit='parts/bad.toml', dotted_key='homes.httpx', expected=Expected.LIST_OF_TEXT
    ),
    WrongShape(
      path_from_unit='pyproject.toml',
      dotted_key='tool.python-check.homes.pydantic',
      expected=Expected.LIST_OF_TEXT,
    ),
    WrongShape(
      path_from_unit='pyproject.toml',
      dotted_key='tool.python-check.homes.attrs',
      expected=Expected.LIST_OF_TEXT,
    ),
    WrongShape(path_from_unit='pyproject.toml', dotted_key='tool.uv', expected=Expected.TABLE),
  )


@pytest.mark.parametrize(
  ('files', 'path_from_unit'),
  [
    pytest.param({'pyproject.toml': '[tool\n'}, 'pyproject.toml', id='the pyproject'),
    pytest.param(
      {
        'pyproject.toml': '[tool.python-check]\nextend = ["parts/pydantic.toml"]\n',
        'parts/pydantic.toml': '[homes\n',
      },
      'parts/pydantic.toml',
      id='a part',
    ),
  ],
)
def test_should_fail_by_the_file_when_it_does_not_parse_as_toml(
  *, tmp_path: Path, files: dict[str, str], path_from_unit: str
) -> None:
  # Arrange
  write_files(tmp_path, files)

  # Act
  with pytest.raises(SettingsError) as raised:
    read_settings(tmp_path)

  # Assert
  (problem,) = raised.value.problems
  assert (type(problem), problem.path_from_unit, type(raised.value.__cause__)) == (
    MalformedFile,
    path_from_unit,
    tomllib.TOMLDecodeError,
  )


TOML_LINES: Final = (
  '[tool]',
  '[tool.python-check]',
  '[tool.python-check.homes]',
  '[tool.uv]',
  '[tool.uv.sources]',
  '[homes]',
  'extend = ["parts/a.toml"]',
  'extend = "parts/a.toml"',
  'homes = 1',
  'httpx = ["edge", "root", "reports"]',
  'httpx = "edge"',
  'shop-money = { workspace = true }',
  'uv = 1',
)
TEXTS: Final = st.lists(
  st.sampled_from(TOML_LINES) | st.text(alphabet=st.characters(codec='utf-8')), max_size=8
).map('\n'.join)


@given(pyproject=TEXTS, part=TEXTS)
def test_should_answer_settings_or_their_problems_for_any_text_of_the_files(
  tmp_path_factory: pytest.TempPathFactory, pyproject: str, part: str
) -> None:
  # Arrange
  unit_path = tmp_path_factory.mktemp('unit')
  write_files(unit_path, {'pyproject.toml': pyproject, 'parts/a.toml': part})

  # Act
  try:
    answered = read_settings(unit_path)
  except SettingsError as error:
    answered = error

  # Assert
  assert isinstance(answered, Settings | SettingsError)
