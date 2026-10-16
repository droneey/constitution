from typing import TYPE_CHECKING

import pytest
from python_check.settings import Settings, SettingsError, settings_of
from source_fixtures import write_files

if TYPE_CHECKING:
  from pathlib import Path


def test_should_give_no_home_when_the_folder_has_no_pyproject(tmp_path: Path) -> None:
  # Arrange
  folder = tmp_path

  # Act
  settings = settings_of(folder)

  # Assert
  assert settings == Settings()


def test_should_give_no_home_when_the_pyproject_names_no_tool(tmp_path: Path) -> None:
  # Arrange
  write_files(tmp_path, {'pyproject.toml': '[project]\nname = "shop"\n'})

  # Act
  settings = settings_of(tmp_path)

  # Assert
  assert settings == Settings()


def test_should_join_the_homes_of_the_parts_and_the_project_when_it_extends_them(
  tmp_path: Path,
) -> None:
  # Arrange
  write_files(
    tmp_path,
    {
      'parts/pydantic.toml': '[homes]\npydantic = ["edge", "shared"]\n',
      'parts/structlog.toml': '[homes]\nstructlog = ["root"]\nhttpx = ["adapters"]\n',
      'pyproject.toml': (
        '[tool.python-check]\n'
        'extend = ["parts/pydantic.toml", "parts/structlog.toml"]\n'
        '[tool.python-check.homes]\n'
        'httpx = ["adapters", "libs"]\n'
      ),
    },
  )

  # Act
  settings = settings_of(tmp_path)

  # Assert
  assert settings.homes == {
    'httpx': ('adapters', 'libs'),
    'pydantic': ('edge', 'shared'),
    'structlog': ('root',),
  }


def test_should_name_the_workspace_units_when_its_sources_link_them(tmp_path: Path) -> None:
  # Arrange
  write_files(
    tmp_path,
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
  )

  # Act
  settings = settings_of(tmp_path)

  # Assert
  assert settings == Settings(units=frozenset({'shop_libs_money', 'shop_shared'}))


@pytest.mark.parametrize(
  ('home', 'shown'),
  [
    pytest.param('"edge"', "'edge'", id='a home written as one folder'),
    pytest.param('["edge", 1]', "['edge', 1]", id='a home that names a number'),
  ],
)
def test_should_fail_when_a_home_is_no_list_of_folders(
  tmp_path: Path, home: str, shown: str
) -> None:
  # Arrange
  write_files(tmp_path, {'pyproject.toml': f'[tool.python-check.homes]\npydantic = {home}\n'})

  # Act
  with pytest.raises(SettingsError) as raised:
    settings_of(tmp_path)

  # Assert
  assert str(raised.value) == f'the home of pydantic is a list of folders, not {shown}'
