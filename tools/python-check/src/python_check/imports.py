import ast
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

from python_check.findings import Finding

SOURCE_ROOT = 'src'
FEATURES = 'features'


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

  if module[:1] != (FEATURES,):
    return

  for name in _absolute_names(node):
    target = tuple(name.split('.'))

    if (
      target[0] == root.folder.name
      and module_of(target_folder(root=root, target=target[1:])) == module
    ):
      yield Finding(
        path=path,
        line=node.lineno,
        message=f'a feature imports itself by its absolute path, {name}; import it relatively',
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
