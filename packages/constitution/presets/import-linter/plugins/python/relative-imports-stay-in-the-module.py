"""An import-linter contract: every relative import stays inside its file's own folder module.

It reads each module of the root packages and reports a relative import that climbs out of the
import package, one that leaves the importer's own folder module, and every relative import of a
file directly in the import package, the package's own surface aside. A file's own folder module is
its first two folders under a folder `feature_form_layers` names, else its first folder.
"""

import ast
import importlib.util
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Final, override

from importlinter import Contract, ContractCheck, fields, output

if TYPE_CHECKING:
  from collections.abc import Iterator

  from grimp import ImportGraph

SURFACE_STEM: Final = '__init__'
MODULE_SUFFIX: Final = '.py'
FEATURE_MODULE_DEPTH: Final = 2
FINDINGS_KEY: Final = 'findings'
PACKAGE_ROOT_LABEL: Final = 'the package root'
CLIMBING_OUT: Final = 'a relative import climbs out of the import package'
LEAVING_MODULE: Final = (
  'a relative import leaves its module, {module}; import it by its absolute path'
)
IN_IMPORT_PACKAGE: Final = (
  'a file directly in the import package imports relatively; import it by its absolute path'
)


@dataclass(frozen=True, slots=True, kw_only=True)
class _SourceFile:
  path: Path
  package_path: Path
  folder: tuple[str, ...]
  stem: str


@dataclass(frozen=True, slots=True, kw_only=True)
class _Finding:
  path: Path
  line_number: int
  message: str


def _package_path(root_package: str) -> Path | None:
  spec = importlib.util.find_spec(root_package)

  if spec is None or spec.submodule_search_locations is None:
    return None

  if len(spec.submodule_search_locations) == 0:
    return None

  return Path(spec.submodule_search_locations[0])


def _source_file(*, module: str, package_path: Path) -> _SourceFile | None:
  parts = tuple(module.split('.')[1:])
  surface_path = package_path.joinpath(*parts, f'{SURFACE_STEM}{MODULE_SUFFIX}')

  if surface_path.is_file():
    return _SourceFile(
      path=surface_path, package_path=package_path, folder=parts, stem=SURFACE_STEM
    )

  if not parts:
    return None

  file_path = package_path.joinpath(*parts[:-1], f'{parts[-1]}{MODULE_SUFFIX}')

  if not file_path.is_file():
    return None

  return _SourceFile(path=file_path, package_path=package_path, folder=parts[:-1], stem=parts[-1])


def _source_files(*, graph: ImportGraph, root_packages: list[str]) -> Iterator[_SourceFile]:
  for root_package in root_packages:
    package_path = _package_path(root_package)

    if package_path is None:
      continue

    for module in sorted(graph.modules):
      if module != root_package and not module.startswith(f'{root_package}.'):
        continue

      source_file = _source_file(module=module, package_path=package_path)

      if source_file is not None:
        yield source_file


@dataclass(frozen=True, slots=True, kw_only=True)
class _Modules:
  feature_form_layers: frozenset[str]

  def module_of(self, folder: tuple[str, ...]) -> tuple[str, ...]:
    is_feature_form = bool(folder) and folder[0] in self.feature_form_layers

    return folder[: FEATURE_MODULE_DEPTH if is_feature_form else 1]


def _target_folder(*, source_file: _SourceFile, target: tuple[str, ...]) -> tuple[str, ...]:
  is_folder = source_file.package_path.joinpath(*target).is_dir()

  return target if is_folder else target[:-1]


def _targets(*, node: ast.ImportFrom, base_folder: tuple[str, ...]) -> tuple[tuple[str, ...], ...]:
  if node.module is not None:
    return ((*base_folder, *node.module.split('.')),)

  return tuple((*base_folder, alias.name) for alias in node.names)


def _label(module: tuple[str, ...]) -> str:
  return '/'.join(module) if module else PACKAGE_ROOT_LABEL


def _relative_findings(
  *, node: ast.ImportFrom, source_file: _SourceFile, modules: _Modules
) -> Iterator[_Finding]:
  folder = source_file.folder

  if not folder and source_file.stem != SURFACE_STEM:
    yield _Finding(path=source_file.path, line_number=node.lineno, message=IN_IMPORT_PACKAGE)

    return

  climbed_count = node.level - 1

  if climbed_count > len(folder):
    yield _Finding(path=source_file.path, line_number=node.lineno, message=CLIMBING_OUT)

    return

  # Why: the import package's own surface re-exports its modules by relative imports.
  if not folder:
    return

  importer_module = modules.module_of(folder)
  base_folder = folder[: len(folder) - climbed_count]

  for target in _targets(node=node, base_folder=base_folder):
    target_folder = _target_folder(source_file=source_file, target=target)

    if modules.module_of(target_folder) != importer_module:
      yield _Finding(
        path=source_file.path,
        line_number=node.lineno,
        message=LEAVING_MODULE.format(module=_label(importer_module)),
      )


def _file_findings(*, source_file: _SourceFile, modules: _Modules) -> Iterator[_Finding]:
  tree = ast.parse(source_file.path.read_bytes(), filename=str(source_file.path))

  for node in ast.walk(tree):
    if isinstance(node, ast.ImportFrom) and node.level > 0:
      yield from _relative_findings(node=node, source_file=source_file, modules=modules)


def _shown_path(*, path: Path, run_path: Path) -> Path:
  resolved_path = path.resolve()

  return resolved_path.relative_to(run_path) if resolved_path.is_relative_to(run_path) else path


def _texts_option(contract: Contract, name: str) -> frozenset[str]:
  value: object = vars(contract)[name]

  if not isinstance(value, list):
    raise TypeError(name)

  texts = frozenset(text for text in value if isinstance(text, str))

  if len(texts) != len(set(value)):
    raise TypeError(name)

  return texts


class RelativeImportsStayInTheModuleContract(Contract):
  """Its option `feature_form_layers` names the top-level folders whose modules are two deep."""

  feature_form_layers = fields.ListField(subfield=fields.StringField())

  @override
  def check(self, graph: ImportGraph, verbose: bool) -> ContractCheck:
    modules = _Modules(feature_form_layers=_texts_option(self, 'feature_form_layers'))
    findings = sorted(
      (
        finding
        for source_file in _source_files(
          graph=graph, root_packages=self.session_options['root_packages']
        )
        for finding in _file_findings(source_file=source_file, modules=modules)
      ),
      key=lambda finding: (finding.path, finding.line_number),
    )

    return ContractCheck(kept=not findings, metadata={FINDINGS_KEY: findings})

  @override
  def render_broken_contract(self, check: ContractCheck) -> None:
    run_path = Path.cwd().resolve()

    for finding in check.metadata[FINDINGS_KEY]:
      # Why: a line rich wraps at the terminal's width splits the path an editor or a check reads.
      output.console.print(
        f'{_shown_path(path=finding.path, run_path=run_path)}:{finding.line_number}: '
        f'{finding.message}',
        style=output.COLORS[output.ERROR],
        markup=False,
        soft_wrap=True,
      )

    output.new_line()
