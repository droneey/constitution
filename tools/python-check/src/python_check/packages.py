import ast
import sys
from dataclasses import dataclass
from enum import StrEnum
from typing import TYPE_CHECKING

from python_check.findings import Finding
from python_check.imports import import_root_of, in_feature_form

if TYPE_CHECKING:
  from pathlib import Path

  from python_check.settings import Settings

ROOT = 'root'
ENTRYPOINTS = 'entrypoints'
DOMAIN = 'domain'
ADAPTERS = 'adapters'
APP = 'app'
# The kernel, the ports it shares among it, is pure, and so is a domain.
PURE = frozenset({'kernel'})
EDGE = frozenset({ADAPTERS, 'integrations', 'libs', ROOT})
ENTRIES = frozenset({'__main__', 'main'})
# The folders of an entry file of its own: entrypoints/<name>/main.py.
ENTRY_DEPTH = 2
# The word a home names the whole edge by.
EDGE_HOME = 'edge'
OWN = frozenset({'__future__', *sys.stdlib_module_names})
# The standard library's modules of input and output, the clock, randomness and identifiers,
# which only the edge imports.
EFFECTS = frozenset(
  {
    'ctypes',
    'curses',
    'dbm',
    'fcntl',
    'fileinput',
    'ftplib',
    'getpass',
    'glob',
    'grp',
    'imaplib',
    'mmap',
    'multiprocessing',
    'os',
    'platform',
    'poplib',
    'pty',
    'pwd',
    'random',
    'resource',
    'runpy',
    'secrets',
    'select',
    'selectors',
    'shelve',
    'shutil',
    'signal',
    'smtplib',
    'socket',
    'socketserver',
    'sqlite3',
    'ssl',
    'subprocess',
    'syslog',
    'tempfile',
    'termios',
    'time',
    'tty',
    'webbrowser',
    'wsgiref',
    'xmlrpc',
  }
)
# What of the standard library reaches an effect although its module's types are pure,
# named as an import or a call spells it.
EFFECT_NAMES = frozenset(
  {
    'asyncio.create_subprocess_exec',
    'asyncio.create_subprocess_shell',
    'asyncio.open_connection',
    'asyncio.open_unix_connection',
    'asyncio.start_server',
    'asyncio.subprocess',
    'bz2.open',
    'codecs.open',
    'datetime.date.today',
    'datetime.datetime.now',
    'datetime.datetime.today',
    'datetime.datetime.utcnow',
    'gzip.open',
    'http.client',
    'http.server',
    'importlib.metadata',
    'input',
    'io.open',
    'locale.setlocale',
    'lzma.open',
    'open',
    'Path.cwd',
    'Path.home',
    'pathlib.Path.cwd',
    'pathlib.Path.home',
    'sys.argv',
    'sys.exit',
    'sys.stderr',
    'sys.stdin',
    'sys.stdout',
    'tarfile.open',
    'urllib.request',
    'uuid.getnode',
    'uuid.uuid1',
    'uuid.uuid4',
    'uuid.uuid6',
    'uuid.uuid7',
    'uuid.uuid8',
    'zipfile.ZipFile',
  }
)
# A call through a class imported from datetime, such as `datetime.now()`.
DATETIME = 'datetime'
# A timer, which a binding unit alone may hold to schedule its own work.
TIMERS = frozenset({'asyncio.sleep', 'threading.Timer'})
# What reads or changes the environment, which only the root and the entry files reach.
ENVIRONMENT = frozenset(
  {'os.environ', 'os.environb', 'os.getenv', 'os.getenvb', 'os.putenv', 'os.unsetenv'}
)


class Role(StrEnum):
  PURE = 'pure'
  EDGE = 'edge'
  INNER = 'inner'


def _is_entry(*, folders: tuple[str, ...], stem: str) -> bool:
  return (not folders and stem in ENTRIES) or (
    folders[:1] == (ENTRYPOINTS,) and len(folders) == ENTRY_DEPTH and stem == 'main'
  )


# The layers a file sits in, by its folders inside the import package: its
# top-level folder and, in a feature or a module of composition, that module's
# layer, its third folder.
def layers_of(folders: tuple[str, ...]) -> tuple[str, ...]:
  return (*folders[:1], *folders[2:3]) if in_feature_form(folders) else folders[:1]


# A file's role by its layers; a top-level folder the tree does not name is no
# part of the edge.
def role_of(*, folders: tuple[str, ...], stem: str) -> Role:
  layers = layers_of(folders)

  if layers and (layers[0] in PURE or layers[1:] == (DOMAIN,)):
    return Role.PURE

  if (
    (layers and layers[0] in EDGE)
    or layers[1:] == (ADAPTERS,)
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


type Aliases = dict[str, str]


# The names an import binds under another name, each with the dotted name it
# stands for: `import datetime as dt` binds dt, `from datetime import datetime as moment` moment.
def _aliased(node: ast.AST) -> tuple[tuple[str, str], ...]:
  match node:
    case ast.Import(names=names):
      return tuple((alias.asname, alias.name) for alias in names if alias.asname is not None)
    case ast.ImportFrom(level=0, module=str(module), names=names):
      return tuple(
        (alias.asname, f'{module}.{alias.name}') for alias in names if alias.asname is not None
      )
    case _:
      return ()


def _aliases_of(tree: ast.Module) -> Aliases:
  return dict(pair for node in ast.walk(tree) for pair in _aliased(node))


def _dotted(node: ast.expr, *, aliases: Aliases) -> str | None:
  match node:
    case ast.Name(id=name):
      return aliases.get(name, name)
    case ast.Attribute(value=value, attr=attr):
      base = _dotted(value, aliases=aliases)
      return None if base is None else f'{base}.{attr}'  # pragma: no mutate -- rootless: no effect
    case _:  # pragma: no mutate -- without it the match falls through to None
      return None


def _named(node: ast.AST, *, aliases: Aliases) -> tuple[str, ...]:
  match node:
    case ast.Import():
      return tuple(alias.name for alias in node.names)
    case ast.ImportFrom(level=0, module=str(module)):
      return (module, *(f'{module}.{alias.name}' for alias in node.names))
    case ast.Attribute():
      name = _dotted(node, aliases=aliases)
      return () if name is None else (name, f'{DATETIME}.{name}')
    case ast.Call(func=ast.Name(id=name)):
      return (name,)
    case _:
      return ()


def _effect(node: ast.AST, *, aliases: Aliases, effects: frozenset[str]) -> str | None:
  return next((name for name in _named(node, aliases=aliases) if name in effects), None)


def _binding(folders: tuple[str, ...]) -> bool:
  return layers_of(folders)[1:] == (APP,)


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
  layers = layers_of(folders)
  return any(folder in layers or (folder == EDGE_HOME and role is Role.EDGE) for folder in home)


@dataclass(frozen=True, slots=True, kw_only=True)
class _Importer:
  folders: tuple[str, ...]
  own: frozenset[str]
  role: Role
  settings: Settings
  where: str


def _package_message(*, importer: _Importer, package: str) -> str | None:
  if package in EFFECTS and importer.role is not Role.EDGE:
    return f'{importer.where} holds no effect, and {package} is one; it reaches it through a port'

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

  packages = tuple(
    Finding(path=path, line=node.lineno, message=message)
    for node in ast.walk(tree)
    if isinstance(node, ast.Import | ast.ImportFrom)
    for package in _packages(node)
    if (message := _package_message(importer=importer, package=package)) is not None
  )
  aliases = _aliases_of(tree)
  effects_here = EFFECT_NAMES if _binding(root.package) else EFFECT_NAMES | TIMERS
  effects = tuple(
    Finding(
      path=path,
      line=node.lineno,
      message=f'{importer.where} holds no effect, and {name} is one; it reaches it through a port',
    )
    for node in ast.walk(tree)
    if importer.role is not Role.EDGE
    and isinstance(node, ast.Import | ast.ImportFrom | ast.Attribute | ast.Call)
    and (name := _effect(node, aliases=aliases, effects=effects_here)) is not None
  )

  environment = tuple(
    Finding(
      path=path,
      line=node.lineno,
      message=f'{importer.where} reads the environment through {name}; only the root reads it',
    )
    for node in ast.walk(tree)
    if importer.role is Role.EDGE
    and root.package[:1] != (ROOT,)
    and not _is_entry(folders=root.package, stem=path.stem)
    and isinstance(node, ast.Import | ast.ImportFrom | ast.Attribute)
    and (
      name := next((name for name in _named(node, aliases=aliases) if name in ENVIRONMENT), None)
    )
    is not None
  )

  return packages + effects + environment
