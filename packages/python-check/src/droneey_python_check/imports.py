import ast
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Final

from droneey_python_check.findings import Finding, Rule

if TYPE_CHECKING:
  from collections.abc import Iterator

SOURCE_ROOT: Final = 'src'
# The layers whose modules take a feature's form, each module a folder of its own.
FEATURE_FORM: Final = frozenset({'composition', 'features'})
# A module of that form is its layer's folder and its own: features/<f>, composition/<m>.
MODULE_DEPTH: Final = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportRoot:
  # the folder of the import package, src/<name>/
  folder: Path
  # the importing file's folder, relative to the import package
  package: tuple[str, ...]
  # every folder of the import package, read at the edge
  folders: frozenset[Path] = frozenset()


def import_root_of(path: Path, *, folders: frozenset[Path] = frozenset()) -> ImportRoot | None:
  parts = path.parts[:-1]

  if SOURCE_ROOT not in parts:
    return None

  start = len(parts) - parts[::-1].index(SOURCE_ROOT)

  if start == len(parts):
    return None

  return ImportRoot(
    folder=Path(*parts[: start + 1]),
    package=parts[start + 1 :],
    folders=folders,
  )


def in_feature_form(folder: tuple[str, ...]) -> bool:
  return bool(folder) and folder[0] in FEATURE_FORM


# A module is a feature or a module of composition, elsewhere a top-level folder
# of the import package; a file that sits in the package itself belongs to its root, ().
def module_of(folder: tuple[str, ...]) -> tuple[str, ...]:
  return folder[: MODULE_DEPTH if in_feature_form(folder) else 1]


def target_folder(*, root: ImportRoot, target: tuple[str, ...]) -> tuple[str, ...]:
  return target if root.folder.joinpath(*target) in root.folders else target[:-1]


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
        rule=Rule.IMPORT_CLIMBS_OUT,
      )
    elif module_of(target_folder(root=root, target=target)) != module:
      name = '/'.join(module) or 'the package root'
      yield Finding(
        path=path,
        line=node.lineno,
        rule=Rule.IMPORT_LEAVES_MODULE,
        values=(name,),
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
        rule=Rule.IMPORT_OF_ITSELF,
        values=(name,),
      )


def import_findings(
  *, path: Path, tree: ast.Module, folders: frozenset[Path]
) -> tuple[Finding, ...]:
  root = import_root_of(path, folders=folders)

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
