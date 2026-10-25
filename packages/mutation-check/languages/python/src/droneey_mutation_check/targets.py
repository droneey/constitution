import ast
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Final

if TYPE_CHECKING:
  from collections.abc import Callable, Iterator, Mapping

SOURCE_ROOT: Final = Path('src')
INIT: Final = '__init__'
# mutmut names a method's mutants by its class between these separators
SEPARATOR: Final = 'ǁ'


@dataclass(frozen=True, slots=True, kw_only=True)
class Changes:
  # the lines each tracked file changed, from a diff against the base
  lines: Mapping[Path, tuple[range, ...]]
  untracked: tuple[Path, ...]
  # every Python file under src/
  sources: tuple[Path, ...]
  read: Callable[[Path], str]


def module_name(path: Path) -> str:
  parts = path.relative_to(SOURCE_ROOT).with_suffix('').parts

  return '.'.join(parts[:-1] if parts[-1] == INIT else parts)


def _functions(tree: ast.Module) -> Iterator[tuple[str, ast.FunctionDef | ast.AsyncFunctionDef]]:
  for node in tree.body:
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
      yield f'x_{node.name}', node
    elif isinstance(node, ast.ClassDef):
      for member in node.body:
        if isinstance(member, ast.FunctionDef | ast.AsyncFunctionDef):
          yield f'x{SEPARATOR}{node.name}{SEPARATOR}{member.name}', member


def _touches(node: ast.FunctionDef | ast.AsyncFunctionDef, lines: tuple[range, ...]) -> bool:
  first = min([node.lineno, *(decorator.lineno for decorator in node.decorator_list)])
  span = range(first, (node.end_lineno or node.lineno) + 1)

  return any(changed.start < span.stop and span.start < changed.stop for changed in lines)


def _function_globs(*, path: Path, source: str, lines: tuple[range, ...] | None) -> Iterator[str]:
  module = module_name(path)

  for key, node in _functions(ast.parse(source)):
    if lines is None or _touches(node, lines):
      yield f'{module}.{key}__mutmut_*'


def mutant_globs(changes: Changes) -> tuple[str, ...]:
  sources = set(changes.sources)
  targets = [
    *((path, None) for path in changes.untracked if path in sources),
    *((path, lines) for path, lines in changes.lines.items() if path in sources),
  ]

  return tuple(
    sorted(
      {
        glob
        for path, lines in targets
        for glob in _function_globs(path=path, source=changes.read(path), lines=lines)
      },
    ),
  )
