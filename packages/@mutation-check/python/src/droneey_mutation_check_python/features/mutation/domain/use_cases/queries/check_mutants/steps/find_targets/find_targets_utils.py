import ast
from typing import TYPE_CHECKING, Final, assert_never

from ......constants import SOURCE_ROOT_PATH
from ......entities import ChangedFile, MutantGlob, NewFile

if TYPE_CHECKING:
  from collections.abc import Callable, Iterator

  from ......entities import Changes, FileChange
  from ......value_objects import UnitRelativePath

INIT_MODULE_NAME: Final = '__init__'
# mutmut names a method's mutants by its class between these separators
CLASS_SEPARATOR: Final = 'ǁ'

type Function = ast.FunctionDef | ast.AsyncFunctionDef


def _module_name(path: UnitRelativePath) -> str:
  parts = path.path.relative_to(SOURCE_ROOT_PATH.path).with_suffix('').parts

  return '.'.join(parts[:-1] if parts[-1] == INIT_MODULE_NAME else parts)


# Each function with the name mutmut gives it within its module.
def _functions(tree: ast.Module) -> Iterator[tuple[str, Function]]:
  for node in tree.body:
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
      yield f'x_{node.name}', node
    elif isinstance(node, ast.ClassDef):
      for member in node.body:
        if isinstance(member, ast.FunctionDef | ast.AsyncFunctionDef):
          yield f'x{CLASS_SEPARATOR}{node.name}{CLASS_SEPARATOR}{member.name}', member


def _touches(function: Function, file: FileChange) -> bool:
  match file:
    case NewFile():
      return True
    case ChangedFile(line_ranges=line_ranges):
      first_line = min(
        [
          function.lineno,
          *(decorator.lineno for decorator in function.decorator_list),
        ]
      )
      function_lines = range(first_line, (function.end_lineno or function.lineno) + 1)

      return any(
        changed.start < function_lines.stop and function_lines.start < changed.stop
        for changed in line_ranges
      )
    case _:  # pragma: no mutate -- no file reaches it
      assert_never(file)  # pragma: no mutate -- no file reaches it


def _function_globs(*, file: FileChange, source_text: str) -> Iterator[MutantGlob]:
  module_name = _module_name(file.path)

  for mutmut_name, function in _functions(ast.parse(source_text)):
    if _touches(function, file):
      yield MutantGlob(f'{module_name}.{mutmut_name}__mutmut_*')


def find_targets(
  changes: Changes, *, read_text: Callable[[UnitRelativePath], str]
) -> tuple[MutantGlob, ...]:
  """The globs of the mutants of every function a change touches."""
  source_paths = set(changes.python_source_paths)

  return tuple(
    sorted(
      {
        glob
        for file in changes.files
        if file.path in source_paths
        for glob in _function_globs(file=file, source_text=read_text(file.path))
      },
    ),
  )
