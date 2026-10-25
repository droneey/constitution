import ast
from typing import TYPE_CHECKING

from ......entities import Finding, Rule, import_root_of, in_feature_form, module_of

if TYPE_CHECKING:
  from collections.abc import Iterator
  from pathlib import Path

  from ......entities import ImportRoot


def _target_folder(*, root: ImportRoot, target: tuple[str, ...]) -> tuple[str, ...]:
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
    elif module_of(_target_folder(root=root, target=target)) != module:
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

    if in_feature_form(module) and module_of(_target_folder(root=root, target=inner)) == module:
      yield Finding(
        path=path,
        line=node.lineno,
        rule=Rule.IMPORT_OF_ITSELF,
        values=(name,),
      )


def check_imports(*, path: Path, tree: ast.Module, folders: frozenset[Path]) -> tuple[Finding, ...]:
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
