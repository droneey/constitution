import ast
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

from python_check.findings import Finding

SOURCE_ROOT = 'src'
FEATURES = 'features'
DOMAIN = 'domain'
# The layers whose top-level folders are modules, each reached through its surface.
MODULE_LAYERS = frozenset({'adapters', 'composition', 'contracts', 'kernel', 'libs', 'shared'})


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportRoot:
  # the folder of the import package, src/<name>/
  folder: Path
  # the importing file's folder, relative to the import package
  package: tuple[str, ...]


def import_root_of(path: Path) -> ImportRoot | None:
  parts = path.parts[:-1]

  if SOURCE_ROOT not in parts:
    return None

  start = len(parts) - parts[::-1].index(SOURCE_ROOT)

  if start == len(parts):
    return None

  return ImportRoot(
    folder=Path(*parts[: start + 1]),
    package=parts[start + 1 :],
  )


# A module is a feature, or outside features/ a top-level folder of the import
# package; a file that sits in the package itself belongs to its root, ().
def module_of(folder: tuple[str, ...]) -> tuple[str, ...]:
  return folder[: 2 if folder[:1] == (FEATURES,) else 1]


# The folder a target lies in: itself when it names a folder, else the folder
# of the file or of the name it names.
def target_folder(*, root: ImportRoot, target: tuple[str, ...]) -> tuple[str, ...]:
  return target if root.folder.joinpath(*target).is_dir() else target[:-1]


# The folder whose surface the rest of its layer reaches it through: a role
# folder of a feature's domain, or a module of a layer; () for any other folder.
def unit_of(folder: tuple[str, ...]) -> tuple[str, ...]:
  if folder[:1] == (FEATURES,) and folder[2:3] == (DOMAIN,) and len(folder) >= 4:
    return folder[:4]

  if len(folder) >= 2 and folder[0] in MODULE_LAYERS:
    return folder[:2]

  return ()


# The unit whose surface an import reaches past, when it names a file or a
# folder inside a unit other than the importer's own.
def _surface_passed(
  *,
  importer: tuple[str, ...],
  root: ImportRoot,
  target: tuple[str, ...],
) -> tuple[str, ...] | None:
  unit = unit_of(target_folder(root=root, target=target))

  if unit and len(target) > len(unit) and unit_of(importer) != unit:
    return unit

  return None


def _relative_targets(
  *,
  node: ast.ImportFrom,
  root: ImportRoot,
) -> Iterator[tuple[str, ...] | None]:
  climbed = node.level - 1

  if climbed > len(root.package):
    yield None
    return

  base = root.package[: len(root.package) - climbed]

  if node.module is not None:
    yield (*base, *node.module.split('.'))
    return

  for alias in node.names:
    yield (*base, alias.name)


def _relative_findings(
  *,
  node: ast.ImportFrom,
  path: Path,
  root: ImportRoot,
) -> Iterator[Finding]:
  module = module_of(root.package)

  for target in _relative_targets(node=node, root=root):
    if target is None:
      yield Finding(
        path=path,
        line=node.lineno,
        message='a relative import climbs out of the import package',
      )
    elif module_of(target_folder(root=root, target=target)) != module:
      name = '/'.join(module) or 'the package root'
      yield Finding(
        path=path,
        line=node.lineno,
        message=f'a relative import leaves its module, {name}; import it by its absolute path',
      )
    elif (unit := _surface_passed(importer=root.package, root=root, target=target)) is not None:
      yield Finding(
        path=path,
        line=node.lineno,
        message=(
          f'a relative import reaches past the surface of {"/".join(unit)}; import that folder'
        ),
      )


def _absolute_names(node: ast.Import | ast.ImportFrom) -> tuple[str, ...]:
  match node:
    case ast.ImportFrom(module=str(module)):
      return (module,)
    case _:
      return tuple(alias.name for alias in node.names)


def _absolute_findings(
  *,
  node: ast.Import | ast.ImportFrom,
  path: Path,
  root: ImportRoot,
) -> Iterator[Finding]:
  module = module_of(root.package)

  for name in _absolute_names(node):
    target = tuple(name.split('.'))
    inner = target[1:]

    if target[0] != root.folder.name:
      continue

    if module[:1] == (FEATURES,) and module_of(target_folder(root=root, target=inner)) == module:
      yield Finding(
        path=path,
        line=node.lineno,
        message=f'a feature imports itself by its absolute path, {name}; import it relatively',
      )
    elif (
      inner[:1] == root.package[:1]
      and (unit := _surface_passed(importer=root.package, root=root, target=inner)) is not None
    ):
      surface = '.'.join((root.folder.name, *unit))
      yield Finding(
        path=path,
        line=node.lineno,
        message=f'an import reaches past the surface of {surface}; import {surface}',
      )


def import_findings(*, path: Path, tree: ast.Module) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if root is None:
    return ()

  return tuple(
    finding
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom)
    for finding in (
      _relative_findings(node=node, path=path, root=root)
      if isinstance(node, ast.ImportFrom) and node.level > 0
      else _absolute_findings(node=node, path=path, root=root)
    )
  )
