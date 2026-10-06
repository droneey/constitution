from pathlib import Path

from python_check.settings import Settings, settings_of
from source_fixtures import write_files


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
