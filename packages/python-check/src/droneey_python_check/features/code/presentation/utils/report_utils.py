from typing import TYPE_CHECKING, Final, assert_never

from ...domain.finding.entities import (
  EffectOutsideEdge,
  EnvironmentOutsideRoot,
  ImportClimbingOut,
  ImportLeavingModule,
  ImportOfItself,
  LongFile,
  LongFunction,
  PackageInPure,
  PackageOutsideHome,
  PackageWithoutHome,
  Unparsable,
)
from ...domain.settings.constants import WHOLE_EDGE_WORD
from ...domain.settings.entities import TopLevelFolder, WholeEdge
from ...domain.settings.errors import (
  Expected,
  MalformedFile,
  MissingPart,
  SettingsError,
  UnknownKey,
  WrongShape,
)
from ...domain.shared.entities import Layer
from ...domain.source.errors import MissingPathsError
from ..constants import ExitStatus
from ..errors import Misuse, UsageError
from . import report_messages as messages

if TYPE_CHECKING:
  from ...domain.finding.entities import Breach, Finding
  from ...domain.settings.entities import HomePlace
  from ...domain.settings.errors import Problem
  from ...domain.shared.types import PackagePath

PROGRAM_NAME: Final = 'python-check'
# Why: editors and scripts parse this layout.
FINDING_LINE: Final = '{path}:{line_number}: {message}'
FOLDER_SEPARATOR: Final = '/'


def _folder_label(folder: PackagePath) -> str:
  return FOLDER_SEPARATOR.join(folder) or messages.PACKAGE_ROOT_LABEL


def _place_label(place: HomePlace) -> str:
  match place:
    case WholeEdge():
      return WHOLE_EDGE_WORD
    case TopLevelFolder(name=name):
      return name
    case Layer():
      return place
    case _:  # pragma: no mutate -- no place reaches it
      assert_never(place)  # pragma: no mutate -- no place reaches it


def _message(breach: Breach) -> str:
  match breach:
    case Unparsable(parser_message=parser_message):
      return messages.UNPARSABLE.format(parser_message=parser_message)
    case LongFile(line_count=line_count, limit=limit):
      return messages.LONG_FILE.format(line_count=line_count, limit=limit)
    case LongFunction(function_name=function_name, line_count=line_count, limit=limit):
      return messages.LONG_FUNCTION.format(
        function_name=function_name, line_count=line_count, limit=limit
      )
    case ImportClimbingOut():
      return messages.IMPORT_CLIMBING_OUT
    case ImportLeavingModule(importer_module=importer_module):
      return messages.IMPORT_LEAVING_MODULE.format(module=_folder_label(importer_module))
    case ImportOfItself(imported_name=imported_name):
      return messages.IMPORT_OF_ITSELF.format(imported_name=imported_name)
    case PackageInPure(folder=folder, package_name=package_name):
      return messages.PACKAGE_IN_PURE.format(
        folder=_folder_label(folder), package_name=package_name
      )
    case PackageWithoutHome(folder=folder, package_name=package_name):
      return messages.PACKAGE_WITHOUT_HOME.format(
        folder=_folder_label(folder), package_name=package_name
      )
    case PackageOutsideHome(folder=folder, package_name=package_name, home=home):
      return messages.PACKAGE_OUTSIDE_HOME.format(
        folder=_folder_label(folder),
        package_name=package_name,
        home=messages.LIST_SEPARATOR.join(_place_label(place) for place in home),
      )
    case EffectOutsideEdge(folder=folder, effect_dotted_name=effect_dotted_name):
      return messages.EFFECT_OUTSIDE_EDGE.format(
        folder=_folder_label(folder), effect_name=effect_dotted_name
      )
    case EnvironmentOutsideRoot(folder=folder, environment_name=environment_name):
      return messages.ENVIRONMENT_OUTSIDE_ROOT.format(
        folder=_folder_label(folder), environment_name=environment_name
      )
    case _:  # pragma: no mutate -- no breach reaches it
      assert_never(breach)  # pragma: no mutate -- no breach reaches it


def render(finding: Finding) -> str:
  return FINDING_LINE.format(
    path=finding.path, line_number=finding.line_number, message=_message(finding.breach)
  )


def exit_status(findings: tuple[Finding, ...]) -> ExitStatus:
  return ExitStatus.FAILED if findings else ExitStatus.PASSED


def _misuse_message(code: Misuse) -> str:
  match code:
    case Misuse.NO_PATH:
      return messages.NO_PATH
    case _:  # pragma: no mutate -- no misuse reaches it
      assert_never(code)  # pragma: no mutate -- no misuse reaches it


def _expected_text(expected: Expected) -> str:
  match expected:
    case Expected.TABLE:
      return messages.TABLE
    case Expected.LIST_OF_TEXT:
      return messages.LIST_OF_TEXT
    case _:  # pragma: no mutate -- no shape reaches it
      assert_never(expected)  # pragma: no mutate -- no shape reaches it


def _problem_message(problem: Problem) -> str:
  match problem:
    case WrongShape():
      return messages.WRONG_SHAPE.format(
        path_from_unit=problem.path_from_unit,
        dotted_key=problem.dotted_key,
        expected=_expected_text(problem.expected),
      )
    case UnknownKey():
      return messages.UNKNOWN_KEY.format(
        path_from_unit=problem.path_from_unit, dotted_key=problem.dotted_key
      )
    case MissingPart():
      return messages.MISSING_PART.format(path_from_unit=problem.path_from_unit)
    case MalformedFile():
      return messages.MALFORMED_FILE.format(
        path_from_unit=problem.path_from_unit, parser_message=problem.parser_message
      )
    case _:  # pragma: no mutate -- no problem reaches it
      assert_never(problem)  # pragma: no mutate -- no problem reaches it


def _error_line(message: str) -> str:
  return messages.ERROR_LINE.format(program=PROGRAM_NAME, message=message)


def render_error(error: Exception) -> str:
  match error:
    case UsageError(code=code):
      return _error_line(_misuse_message(code)) + messages.USAGE_LINE.format(program=PROGRAM_NAME)
    case MissingPathsError(paths=paths):
      missing_paths = messages.LIST_SEPARATOR.join(str(path) for path in paths)

      return _error_line(
        messages.MISSING_PATHS.format(paths=missing_paths)
      ) + messages.USAGE_LINE.format(program=PROGRAM_NAME)
    case SettingsError(problems=problems):
      return ''.join(_error_line(_problem_message(problem)) for problem in problems)
    case _:
      return _error_line(messages.OWN_ERROR.format(error=error))


def error_status(error: Exception) -> ExitStatus:
  match error:
    case UsageError() | MissingPathsError():
      return ExitStatus.USAGE
    case SettingsError():
      return ExitStatus.SETTINGS
    case _:
      return ExitStatus.DEFECT
