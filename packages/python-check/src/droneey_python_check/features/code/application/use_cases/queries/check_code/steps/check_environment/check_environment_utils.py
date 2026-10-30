import ast
from typing import TYPE_CHECKING

from .......domain.constants import ENVIRONMENT_NAMES
from .......domain.entities import (
  EnvironmentOutsideRoot,
  Finding,
  Layer,
  import_root_of,
  is_edge,
  is_entry,
  role_of,
)
from ...utils import aliases_of, named_one_of

if TYPE_CHECKING:
  from pathlib import Path


def check_environment(*, path: Path, tree: ast.Module) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if (
    root is None
    or not is_edge(role_of(file_folder=root.file_folder, file_stem=path.stem))
    or root.file_folder[:1] == (Layer.ROOT,)
    or is_entry(file_folder=root.file_folder, file_stem=path.stem)
  ):
    return ()

  aliases = aliases_of(tree)

  return tuple(
    Finding(
      path=path,
      line_number=node.lineno,
      breach=EnvironmentOutsideRoot(folder=root.file_folder, environment_name=environment_name),
    )
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom | ast.Attribute)
    and (environment_name := named_one_of(node, aliases=aliases, names=ENVIRONMENT_NAMES))
    is not None
  )
