import ast
import re
from collections.abc import Callable, Iterator, Mapping
from dataclasses import dataclass
from pathlib import Path

SOURCE_ROOT = Path('src')
SPEC = re.compile(r'^test_(?P<name>[a-z0-9_]+)\.py$')
TESTS = 'tests'
INIT = '__init__'
# mutmut names a method's mutants by its class between these separators
SEPARATOR = 'ǁ'


@dataclass(frozen=True, slots=True, kw_only=True)
class Changes:
  # the lines each tracked file changed, from a diff against the base
  lines: Mapping[Path, tuple[range, ...]]
  # the files git does not track yet
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


def _imported_sources(*, spec: str, sources: tuple[Path, ...]) -> Iterator[Path]:
  by_module = {module_name(source): source for source in sources}

  for node in ast.walk(ast.parse(spec)):
    if isinstance(node, ast.ImportFrom) and node.module is not None:
      names = [node.module, *(f'{node.module}.{alias.name}' for alias in node.names)]
    elif isinstance(node, ast.Import):
      names = [alias.name for alias in node.names]
    else:
      continue

    yield from (by_module[name] for name in names if name in by_module)


def _proven_sources(changes: Changes) -> Iterator[Path]:
  for path in (*changes.lines, *changes.untracked):
    spec = SPEC.match(path.name)

    if spec is None or TESTS not in path.parts:
      continue

    yield from (source for source in changes.sources if source.stem == spec['name'])
    yield from _imported_sources(spec=changes.read(path), sources=changes.sources)


def mutant_globs(changes: Changes) -> tuple[str, ...]:
  sources = set(changes.sources)
  whole = {path for path in changes.untracked if path in sources} | set(_proven_sources(changes))
  touched = {
    path: lines for path, lines in changes.lines.items() if path in sources and path not in whole
  }

  return tuple(
    sorted(
      {
        glob
        for path, lines in [*((path, None) for path in whole), *touched.items()]
        for glob in _function_globs(path=path, source=changes.read(path), lines=lines)
      },
    ),
  )
