import ast
from dataclasses import dataclass
from typing import TYPE_CHECKING, assert_never

from .......domain.entities import (
  FileRole,
  Finding,
  Layer,
  PackageInPure,
  PackageOutsideHome,
  PackageWithoutHome,
  TopLevelFolder,
  WholeEdge,
  import_root_of,
  is_edge,
  layers_of,
  may_import_packages,
  role_of,
)
from ...utils import imported_package_names

if TYPE_CHECKING:
  from pathlib import Path

  from .......domain.entities import Breach, HomePlace, Settings
  from .......domain.types import PackagePath


def _breach(
  *, home: tuple[HomePlace, ...] | None, package_name: str, role: FileRole, folder: PackagePath
) -> Breach | None:
  match role:
    case FileRole.PURE:
      return PackageInPure(folder=folder, package_name=package_name)
    case FileRole.EDGE:
      if home is None:
        return None

      return PackageOutsideHome(folder=folder, package_name=package_name, home=home)
    case FileRole.INNER:
      if home is None:
        return PackageWithoutHome(folder=folder, package_name=package_name)

      return PackageOutsideHome(folder=folder, package_name=package_name, home=home)
    case _:  # pragma: no mutate -- no role reaches it
      assert_never(role)  # pragma: no mutate -- no role reaches it


def _in_place(*, place: HomePlace, file_folder: PackagePath, role: FileRole) -> bool:
  match place:
    case WholeEdge():
      return is_edge(role)
    case TopLevelFolder(name=name):
      return file_folder[:1] == (name,)
    case Layer():
      return place in layers_of(file_folder)
    case _:  # pragma: no mutate -- no place reaches it
      assert_never(place)  # pragma: no mutate -- no place reaches it


@dataclass(frozen=True, slots=True, kw_only=True)
class _Importer:
  file_folder: PackagePath
  own_package_names: frozenset[str]
  role: FileRole
  settings: Settings


def _package_breach(*, importer: _Importer, package_name: str) -> Breach | None:
  if package_name in importer.own_package_names:
    return None

  home = importer.settings.homes_by_import_name.get(package_name)

  if (
    home is not None
    and may_import_packages(importer.role)
    and any(
      _in_place(place=place, file_folder=importer.file_folder, role=importer.role) for place in home
    )
  ):
    return None

  return _breach(
    home=home, package_name=package_name, role=importer.role, folder=importer.file_folder
  )


def check_packages(
  *, path: Path, tree: ast.Module, settings: Settings, standard_module_names: frozenset[str]
) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if root is None:
    return ()

  importer = _Importer(
    file_folder=root.file_folder,
    own_package_names=frozenset(
      {root.package_path.name, *settings.workspace_unit_import_names, *standard_module_names}
    ),
    role=role_of(file_folder=root.file_folder, file_stem=path.stem),
    settings=settings,
  )

  return tuple(
    Finding(path=path, line_number=node.lineno, breach=breach)
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom)
    for package_name in imported_package_names(node)
    if (breach := _package_breach(importer=importer, package_name=package_name)) is not None
  )
