import ast
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

from python_check.findings import Finding

SOURCE_ROOT = 'src'
# The layers whose modules take a feature's form, each module a folder of its own.
FEATURE_FORM = frozenset({'composition', 'features'})
# A module of that form is its layer's folder and its own: features/<f>, composition/<m>.
MODULE_DEPTH = 2


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


def in_feature_form(folder: tuple[str, ...]) -> bool:
  return bool(folder) and folder[0] in FEATURE_FORM


# A module is a feature or a module of composition, elsewhere a top-level folder
# of the import package; a file that sits in the package itself belongs to its root, ().
def module_of(folder: tuple[str, ...]) -> tuple[str, ...]:
  return folder[: MODULE_DEPTH if in_feature_form(folder) else 1]


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

  for name in _absolute_names(node):
    target = tuple(name.split('.'))
    inner = target[1:]

    if target[0] != root.folder.name:
      continue

    if in_feature_form(module) and module_of(target_folder(root=root, target=inner)) == module:
      yield Finding(
        path=path,
        line=node.lineno,
        message=f'a module imports itself by its absolute path, {name}; import it relatively',
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
