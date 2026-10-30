import ast
from typing import TYPE_CHECKING, Final

from .......domain.changes.constants import SOURCE_ROOT_PATH
from .......domain.changes.entities import python_source_files, touches
from .......domain.mutation_targets.entities import MutantGlob

if TYPE_CHECKING:
  from collections.abc import Callable, Iterator

  from .......domain.changes.entities import Changes, FileChange
  from .......domain.changes.value_objects import UnitRelativePath

INIT_MODULE_NAME: Final = '__init__'
# Why: mutmut names a method's mutants by its class between these separators.
CLASS_SEPARATOR: Final = 'ǁ'

type Function = ast.FunctionDef | ast.AsyncFunctionDef


def _module_name(path: UnitRelativePath) -> str:
  parts = path.path.relative_to(SOURCE_ROOT_PATH.path).with_suffix('').parts

  return '.'.join(parts[:-1] if parts[-1] == INIT_MODULE_NAME else parts)


def _functions_by_mutmut_name(tree: ast.Module) -> Iterator[tuple[str, Function]]:
  for node in tree.body:
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
      yield f'x_{node.name}', node
    elif isinstance(node, ast.ClassDef):
      for member in node.body:
        if isinstance(member, ast.FunctionDef | ast.AsyncFunctionDef):
          yield f'x{CLASS_SEPARATOR}{node.name}{CLASS_SEPARATOR}{member.name}', member


def _first_line(function: Function) -> int:
  return min([function.lineno, *(decorator.lineno for decorator in function.decorator_list)])


def _function_globs(*, file: FileChange, source_text: str) -> Iterator[MutantGlob]:
  module_name = _module_name(file.path)

  for mutmut_name, function in _functions_by_mutmut_name(ast.parse(source_text)):
    if touches(
      file,
      first_line=_first_line(function),
      last_line=function.end_lineno or function.lineno,
    ):
      yield MutantGlob(f'{module_name}.{mutmut_name}__mutmut_*')


def find_targets(
  changes: Changes, *, read_text: Callable[[UnitRelativePath], str]
) -> tuple[MutantGlob, ...]:
  return tuple(
    sorted(
      {
        glob
        for file in python_source_files(changes)
        for glob in _function_globs(file=file, source_text=read_text(file.path))
      },
    ),
  )
