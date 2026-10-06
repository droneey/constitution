import ast
import sys
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path

from python_check.findings import Finding
from python_check.imports import import_root_of
from python_check.settings import Settings

FEATURES = 'features'
ENTRYPOINTS = 'entrypoints'
LAYERS = frozenset(
  {
    'adapters',
    'composition',
    'contracts',
    ENTRYPOINTS,
    FEATURES,
    'integrations',
    'kernel',
    'libs',
    'root',
    'shared',
  }
)
# Every role folder the blocks' vocabularies name, which no delivery layer is.
ROLES = frozenset(
  {
    'commands',
    'components',
    'constants',
    'entities',
    'errors',
    'models',
    'providers',
    'queries',
    'repositories',
    'sinks',
    'steps',
    'types',
    'use_cases',
    'utils',
    'value_objects',
  }
)
PURE = frozenset({'contracts', 'kernel'})
EDGE = frozenset({'adapters', 'integrations', 'libs', 'root'})
ENTRIES = frozenset({'__main__', 'main'})
# The word a home names the whole edge by.
EDGE_HOME = 'edge'
OWN = frozenset({'__future__', *sys.stdlib_module_names})


class Role(StrEnum):
  PURE = 'pure'
  EDGE = 'edge'
  INNER = 'inner'


def _is_entry(*, folders: tuple[str, ...], stem: str) -> bool:
  return (not folders and stem in ENTRIES) or (
    folders[:1] == (ENTRYPOINTS,) and len(folders) == 2 and stem == 'main'
  )


# A file's role by its folders inside the import package: a feature's layer is
# its third folder, and a top-level folder that is no layer is the delivery layer.
def role_of(*, folders: tuple[str, ...], stem: str) -> Role:
  top = folders[:1]
  layer = folders[2:3] if top == (FEATURES,) else ()

  if top and (top[0] in PURE or layer == ('domain',)):
    return Role.PURE

  if (
    (top and (top[0] in EDGE or top[0] not in LAYERS | ROLES))
    or layer == ('adapters',)
    or _is_entry(folders=folders, stem=stem)
  ):
    return Role.EDGE

  return Role.INNER


def _packages(node: ast.Import | ast.ImportFrom) -> tuple[str, ...]:
  match node:
    case ast.ImportFrom(level=0, module=str(module)):
      return (module.split('.')[0],)
    case ast.Import():
      return tuple(alias.name.split('.')[0] for alias in node.names)
    case _:
      return ()


def _message(*, home: tuple[str, ...] | None, package: str, role: Role, where: str) -> str | None:
  if role is Role.PURE:
    return f'{where} imports no package, and {package} is one'

  if home is None:
    return (
      None
      if role is Role.EDGE
      else f'{package} has no home in {where}; a package without one is imported at the edge'
    )

  return f'{package} is imported in {where}, outside its home: {", ".join(home)}'


def _in_home(*, folders: tuple[str, ...], home: tuple[str, ...], role: Role) -> bool:
  return any(folder in folders or (folder == EDGE_HOME and role is Role.EDGE) for folder in home)


@dataclass(frozen=True, slots=True, kw_only=True)
class _Importer:
  folders: tuple[str, ...]
  own: frozenset[str]
  role: Role
  settings: Settings
  where: str


def _package_message(*, importer: _Importer, package: str) -> str | None:
  home = importer.settings.homes.get(package)

  if package in importer.own or (
    home is not None
    and importer.role is not Role.PURE
    and _in_home(folders=importer.folders, home=home, role=importer.role)
  ):
    return None

  return _message(home=home, package=package, role=importer.role, where=importer.where)


def package_findings(*, path: Path, settings: Settings, tree: ast.Module) -> tuple[Finding, ...]:
  root = import_root_of(path)

  if root is None:
    return ()

  importer = _Importer(
    folders=root.package,
    own=frozenset({root.folder.name, *settings.units, *OWN}),
    role=role_of(folders=root.package, stem=path.stem),
    settings=settings,
    where='/'.join(root.package) or 'the package root',
  )

  return tuple(
    Finding(path=path, line=node.lineno, message=message)
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom)
    for package in _packages(node)
    if (message := _package_message(importer=importer, package=package)) is not None
  )
