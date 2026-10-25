import ast
from dataclasses import dataclass
from enum import IntEnum, unique
from pathlib import Path
from typing import TYPE_CHECKING

from droneey_python_check.findings import Finding, Rule
from droneey_python_check.imports import import_findings
from droneey_python_check.lines import line_findings
from droneey_python_check.packages import package_findings
from droneey_python_check.usage_error import Misuse, UsageError

if TYPE_CHECKING:
  from collections.abc import Sequence

  from droneey_python_check.settings import Settings


@unique
class ExitStatus(IntEnum):
  PASSED = 0
  FAILED = 1
  USAGE = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class Source:
  path: Path
  text: bytes


@dataclass(frozen=True, slots=True, kw_only=True)
class Sources:
  files: tuple[Source, ...]
  # every folder of the import packages the files sit in
  folders: frozenset[Path]


def paths_of(arguments: Sequence[str]) -> tuple[Path, ...]:
  """The paths the command line names.

  Raises:
    UsageError: it names none.
  """
  if not arguments:
    raise UsageError(code=Misuse.NO_PATH)

  return tuple(Path(argument) for argument in arguments)


def file_findings(
  *, source: Source, settings: Settings, folders: frozenset[Path]
) -> tuple[Finding, ...]:
  path = source.path

  try:
    tree = ast.parse(source.text)
  except SyntaxError as error:
    line = error.lineno or 1  # pragma: no mutate -- ast.parse gives every SyntaxError its line
    return (Finding(path=path, line=line, rule=Rule.SYNTAX, values=(error.msg,)),)

  return (
    line_findings(path=path, tree=tree, source=source.text)
    + import_findings(path=path, tree=tree, folders=folders)
    + package_findings(path=path, settings=settings, tree=tree)
  )


def findings_of(*, sources: Sources, settings: Settings) -> tuple[Finding, ...]:
  return tuple(
    finding
    for source in sources.files
    for finding in file_findings(source=source, settings=settings, folders=sources.folders)
  )


def exit_status(findings: tuple[Finding, ...]) -> ExitStatus:
  return ExitStatus.FAILED if findings else ExitStatus.PASSED
