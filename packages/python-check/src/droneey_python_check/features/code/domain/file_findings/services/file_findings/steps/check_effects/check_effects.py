import ast
from typing import TYPE_CHECKING

from ......file_role.entities import import_root_of, is_binding_unit, is_edge, role_of
from ......finding.entities import EffectOutsideEdge, Finding
from .....constants import EFFECT_MODULE_NAMES, EFFECT_NAMES_OF_PURE_MODULES, TIMER_NAMES
from .....utils import aliases_of, imported_package_names, named_one_of

if TYPE_CHECKING:
  from collections.abc import Iterator, Mapping
  from pathlib import Path


def _effect_names(
  node: ast.AST, *, aliases: Mapping[str, str], effect_names: frozenset[str]
) -> Iterator[str]:
  if isinstance(node, ast.Import | ast.ImportFrom):
    yield from (name for name in imported_package_names(node) if name in EFFECT_MODULE_NAMES)

  effect_name = named_one_of(node, aliases=aliases, names=effect_names)

  if effect_name is not None:
    yield effect_name


def check_effects(*, path: Path, tree: ast.Module) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if root is None or is_edge(role_of(file_folder=root.file_folder, file_stem=path.stem)):
    return ()

  aliases = aliases_of(tree)
  effect_names = (
    EFFECT_NAMES_OF_PURE_MODULES
    if is_binding_unit(root.file_folder)
    else EFFECT_NAMES_OF_PURE_MODULES | TIMER_NAMES
  )

  return tuple(
    Finding(
      path=path,
      line_number=node.lineno,
      breach=EffectOutsideEdge(folder=root.file_folder, effect_dotted_name=effect_name),
    )
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom | ast.Attribute | ast.Call)
    for effect_name in _effect_names(node, aliases=aliases, effect_names=effect_names)
  )
