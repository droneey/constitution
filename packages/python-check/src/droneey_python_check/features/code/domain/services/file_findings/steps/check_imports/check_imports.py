import ast
from dataclasses import dataclass
from typing import TYPE_CHECKING, assert_never

from .....entities import (
  Finding,
  ImportClimbingOut,
  ImportLeavingModule,
  ImportOfItself,
  import_root_of,
  in_feature_form,
  module_of,
)
from .....types import PackagePath

if TYPE_CHECKING:
  from collections.abc import Iterator
  from pathlib import Path

  from .....entities import ImportRoot


@dataclass(frozen=True, slots=True, kw_only=True)
class _Importer:
  path: Path
  root: ImportRoot
  package_folder_paths: frozenset[Path]


@dataclass(frozen=True, slots=True)
class _ClimbsOut:
  pass


def _target_folder(*, importer: _Importer, target: PackagePath) -> PackagePath:
  is_folder = importer.root.package_path.joinpath(*target) in importer.package_folder_paths

  return target if is_folder else PackagePath(target[:-1])


def _relative_targets(
  *, node: ast.ImportFrom, root: ImportRoot
) -> Iterator[PackagePath | _ClimbsOut]:
  climbed_count = node.level - 1

  if climbed_count > len(root.file_folder):
    yield _ClimbsOut()

    return

  base_folder = root.file_folder[: len(root.file_folder) - climbed_count]

  if node.module is not None:
    yield PackagePath((*base_folder, *node.module.split('.')))

    return

  for alias in node.names:
    yield PackagePath((*base_folder, alias.name))


def _relative_findings(*, node: ast.ImportFrom, importer: _Importer) -> Iterator[Finding]:
  importer_module = module_of(importer.root.file_folder)

  for target in _relative_targets(node=node, root=importer.root):
    match target:
      case _ClimbsOut():
        yield Finding(path=importer.path, line_number=node.lineno, breach=ImportClimbingOut())
      case tuple():
        if module_of(_target_folder(importer=importer, target=target)) != importer_module:
          yield Finding(
            path=importer.path,
            line_number=node.lineno,
            breach=ImportLeavingModule(importer_module=importer_module),
          )
      case _:  # pragma: no mutate -- no target reaches it
        assert_never(target)  # pragma: no mutate -- no target reaches it


def _absolute_findings(
  *, imported_names: tuple[str, ...], line_number: int, importer: _Importer
) -> Iterator[Finding]:
  importer_module = module_of(importer.root.file_folder)

  for imported_name in imported_names:
    package_name, *inner_names = imported_name.split('.')

    if package_name != importer.root.package_path.name:
      continue

    target_folder = _target_folder(importer=importer, target=PackagePath(tuple(inner_names)))

    if in_feature_form(importer_module) and module_of(target_folder) == importer_module:
      yield Finding(
        path=importer.path,
        line_number=line_number,
        breach=ImportOfItself(imported_name=imported_name),
      )


def _import_findings(
  *, node: ast.Import | ast.ImportFrom, importer: _Importer
) -> Iterator[Finding]:
  match node:
    case ast.ImportFrom(level=0, module=str(module_name)):
      return _absolute_findings(
        imported_names=(module_name,), line_number=node.lineno, importer=importer
      )
    case ast.ImportFrom():
      return _relative_findings(node=node, importer=importer)
    case ast.Import():
      return _absolute_findings(
        imported_names=tuple(alias.name for alias in node.names),
        line_number=node.lineno,
        importer=importer,
      )
    case _:  # pragma: no mutate -- no import reaches it
      assert_never(node)  # pragma: no mutate -- no import reaches it


def check_imports(
  *, path: Path, tree: ast.Module, package_folder_paths: frozenset[Path]
) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if root is None:
    return ()

  importer = _Importer(path=path, root=root, package_folder_paths=package_folder_paths)

  return tuple(
    finding
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom)
    for finding in _import_findings(node=node, importer=importer)
  )
