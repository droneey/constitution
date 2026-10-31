import ast
from typing import TYPE_CHECKING

from ....finding.entities import Finding, Unparsable
from .steps import check_effects, check_environment, check_imports, check_lines, check_packages

if TYPE_CHECKING:
  from pathlib import Path

  from ....settings.entities import Settings
  from ....source.entities import Source


def file_findings(
  *,
  source: Source,
  package_folder_paths: frozenset[Path],
  settings: Settings,
  standard_module_names: frozenset[str],
) -> tuple[Finding, ...]:
  path = source.path

  try:
    tree = ast.parse(source.content)
  except SyntaxError as error:
    line_number = error.lineno or 1  # pragma: no mutate -- ast.parse gives each SyntaxError one
    breach = Unparsable(parser_message=error.msg)

    return (Finding(path=path, line_number=line_number, breach=breach),)

  return (
    check_lines(path=path, tree=tree, content=source.content)
    + check_imports(path=path, tree=tree, package_folder_paths=package_folder_paths)
    + check_packages(
      path=path, tree=tree, settings=settings, standard_module_names=standard_module_names
    )
    + check_effects(path=path, tree=tree)
    + check_environment(path=path, tree=tree)
  )
