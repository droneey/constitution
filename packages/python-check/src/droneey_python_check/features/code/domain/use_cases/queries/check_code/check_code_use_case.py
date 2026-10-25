import ast
from typing import TYPE_CHECKING

from ....entities import Finding, Rule
from .steps import check_imports, check_lines, check_packages

if TYPE_CHECKING:
  from pathlib import Path

  from ....entities import Settings, Source, Sources


def _file_findings(
  *, source: Source, settings: Settings, folders: frozenset[Path]
) -> tuple[Finding, ...]:
  path = source.path

  try:
    tree = ast.parse(source.text)
  except SyntaxError as error:
    line = error.lineno or 1  # pragma: no mutate -- ast.parse gives every SyntaxError its line
    return (Finding(path=path, line=line, rule=Rule.SYNTAX, values=(error.msg,)),)

  return (
    check_lines(path=path, tree=tree, source=source.text)
    + check_imports(path=path, tree=tree, folders=folders)
    + check_packages(path=path, settings=settings, tree=tree)
  )


def check_code(*, sources: Sources, settings: Settings) -> tuple[Finding, ...]:
  return tuple(
    finding
    for source in sources.files
    for finding in _file_findings(source=source, settings=settings, folders=sources.folders)
  )
