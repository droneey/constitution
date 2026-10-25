import tomllib

import pytest

from droneey_python_check.settings import (
  Expected,
  Problem,
  Settings,
  SettingsError,
  extends_of,
  settings_of,
)


def _settings(pyproject: str | None, parts: dict[str, str | None] | None = None) -> Settings:
  return settings_of(
    pyproject=None if pyproject is None else tomllib.loads(pyproject),
    parts={
      name: None if text is None else tomllib.loads(text) for name, text in (parts or {}).items()
    },
  )


@pytest.mark.parametrize(
  'pyproject',
  [
    pytest.param(None, id='no pyproject'),
    pytest.param('[project]\nname = "shop"\n', id='a pyproject that names no tool'),
  ],
)
def test_should_give_no_home_when_nothing_names_one(pyproject: str | None) -> None:
  # Act
  settings = _settings(pyproject)

  # Assert
  assert settings == Settings()


@pytest.mark.parametrize(
  ('pyproject', 'parts'),
  [
    pytest.param(None, (), id='no pyproject'),
    pytest.param(
      '[tool.python-check]\nextend = ["parts/a.toml", "parts/b.toml"]\n',
      ('parts/a.toml', 'parts/b.toml'),
      id='a pyproject that extends parts',
    ),
    pytest.param('[tool.python-check]\nextend = "parts/a.toml"\n', (), id='an extend of no list'),
  ],
)
def test_should_name_the_parts_a_pyproject_extends(
  pyproject: str | None, parts: tuple[str, ...]
) -> None:
  # Arrange
  document = None if pyproject is None else tomllib.loads(pyproject)

  # Act
  extended = extends_of(document)

  # Assert
  assert extended == parts


def test_should_join_the_homes_of_the_parts_and_the_project_when_it_extends_them() -> None:
  # Arrange
  pyproject = (
    '[tool.python-check]\n'
    'extend = ["parts/pydantic.toml", "parts/structlog.toml"]\n'
    '[tool.python-check.homes]\n'
    'httpx = ["adapters", "libs"]\n'
  )
  parts: dict[str, str | None] = {
    'parts/pydantic.toml': '[homes]\npydantic = ["edge", "shared"]\n',
    'parts/structlog.toml': '[homes]\nstructlog = ["root"]\nhttpx = ["adapters"]\n',
  }

  # Act
  settings = _settings(pyproject, parts)

  # Assert
  assert settings.homes == {
    'httpx': ('adapters', 'libs'),
    'pydantic': ('edge', 'shared'),
    'structlog': ('root',),
  }


def test_should_name_the_workspace_units_when_its_sources_link_them() -> None:
  # Arrange
  pyproject = (
    '[tool.uv.sources]\n'
    '"Shop-Libs.Money" = { workspace = true }\n'
    'shop-shared = { workspace = true }\n'
    'vendored = { path = "../vendored" }\n'
    'pinned = { workspace = false }\n'
    'split = [{ index = "a", marker = "sys_platform == \'linux\'" }]\n'
  )

  # Act
  settings = _settings(pyproject)

  # Assert
  assert settings == Settings(units=frozenset({'shop_libs_money', 'shop_shared'}))


def test_should_fail_with_every_problem_when_the_settings_have_the_wrong_shape() -> None:
  # Arrange
  pyproject = (
    '[tool]\n'
    'uv = 1\n'
    '[tool.python-check]\n'
    'extend = ["parts/missing.toml", "parts/flat.toml", "parts/bad.toml"]\n'
    '[tool.python-check.homes]\n'
    'pydantic = "edge"\n'
    'attrs = ["edge", 1]\n'
  )
  parts: dict[str, str | None] = {
    'parts/missing.toml': None,
    'parts/flat.toml': 'homes = ["edge"]\n',
    'parts/bad.toml': '[homes]\nhttpx = "adapters"\n',
  }

  # Act
  with pytest.raises(SettingsError) as raised:
    _settings(pyproject, parts)

  # Assert
  assert raised.value.problems == (
    Problem(file='parts/missing.toml', key='', expected=Expected.FILE),
    Problem(file='parts/flat.toml', key='homes', expected=Expected.TABLE),
    Problem(file='parts/bad.toml', key='homes.httpx', expected=Expected.LIST_OF_TEXT),
    Problem(
      file='pyproject.toml', key='tool.python-check.homes.pydantic', expected=Expected.LIST_OF_TEXT
    ),
    Problem(
      file='pyproject.toml', key='tool.python-check.homes.attrs', expected=Expected.LIST_OF_TEXT
    ),
    Problem(file='pyproject.toml', key='tool.uv', expected=Expected.TABLE),
  )


@pytest.mark.parametrize(
  ('pyproject', 'problem'),
  [
    pytest.param(
      'tool = 1\n',
      Problem(file='pyproject.toml', key='tool', expected=Expected.TABLE),
      id='a tool of no table',
    ),
    pytest.param(
      'tool = { python-check = 1 }\n',
      Problem(file='pyproject.toml', key='tool.python-check', expected=Expected.TABLE),
      id='its own table of no table',
    ),
    pytest.param(
      '[tool.python-check]\nextend = "parts/a.toml"\n',
      Problem(
        file='pyproject.toml', key='tool.python-check.extend', expected=Expected.LIST_OF_TEXT
      ),
      id='an extend of no list',
    ),
    pytest.param(
      '[tool.python-check]\nhomes = 1\n',
      Problem(file='pyproject.toml', key='tool.python-check.homes', expected=Expected.TABLE),
      id='homes of no table',
    ),
    pytest.param(
      '[tool.uv]\nsources = 1\n',
      Problem(file='pyproject.toml', key='tool.uv.sources', expected=Expected.TABLE),
      id='sources of no table',
    ),
  ],
)
def test_should_fail_by_the_key_when_a_table_of_the_pyproject_has_the_wrong_shape(
  pyproject: str, problem: Problem
) -> None:
  # Act
  with pytest.raises(SettingsError) as raised:
    _settings(pyproject)

  # Assert
  assert raised.value.problems == (problem,)
