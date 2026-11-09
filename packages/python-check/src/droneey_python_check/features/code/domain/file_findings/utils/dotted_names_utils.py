import ast
from typing import TYPE_CHECKING, assert_never

from ..constants import DATETIME_MODULE_NAME

if TYPE_CHECKING:
  from collections.abc import Mapping


def imported_package_names(node: ast.Import | ast.ImportFrom) -> tuple[str, ...]:
  match node:
    case ast.ImportFrom(level=0, module=str(module_name)):
      return (module_name.split('.')[0],)
    case ast.ImportFrom():
      return ()
    case ast.Import():
      return tuple(alias.name.split('.')[0] for alias in node.names)
    case _:  # pragma: no mutate -- no import reaches it
      assert_never(node)  # pragma: no mutate -- no import reaches it


def _aliased(node: ast.AST) -> tuple[tuple[str, str], ...]:
  match node:
    case ast.Import(names=names):
      return tuple((alias.asname, alias.name) for alias in names if alias.asname is not None)
    case ast.ImportFrom(level=0, module=str(module_name), names=names):
      return tuple(
        (alias.asname, f'{module_name}.{alias.name}') for alias in names if alias.asname is not None
      )
    case _:
      return ()


def aliases_of(tree: ast.Module) -> Mapping[str, str]:
  return dict(pair for node in ast.walk(tree) for pair in _aliased(node))


def _dotted_name(node: ast.expr, *, aliases: Mapping[str, str]) -> str | None:
  match node:
    case ast.Name(id=name):
      return aliases.get(name, name)
    case ast.Attribute(value=value, attr=attr):
      base = _dotted_name(value, aliases=aliases)

      return None if base is None else f'{base}.{attr}'  # pragma: no mutate -- rootless: no effect
    case _:  # pragma: no mutate -- without it the match falls through to None
      return None


# Why: a class imported from datetime is called bare, e.g. datetime.now for datetime.datetime.now.
def _through_a_datetime_class(dotted_name: str) -> str:
  return f'{DATETIME_MODULE_NAME}.{dotted_name}'


def _names_of(node: ast.AST, *, aliases: Mapping[str, str]) -> tuple[str, ...]:
  match node:
    case ast.Import():
      return tuple(alias.name for alias in node.names)
    case ast.ImportFrom(level=0, module=str(module_name)):
      return (module_name, *(f'{module_name}.{alias.name}' for alias in node.names))
    case ast.Attribute():
      dotted_name = _dotted_name(node, aliases=aliases)

      return () if dotted_name is None else (dotted_name, _through_a_datetime_class(dotted_name))
    case ast.Call(func=ast.Name(id=name)):
      return (name,)
    case _:
      return ()


def named_one_of(node: ast.AST, *, aliases: Mapping[str, str], names: frozenset[str]) -> str | None:
  return next((name for name in _names_of(node, aliases=aliases) if name in names), None)
