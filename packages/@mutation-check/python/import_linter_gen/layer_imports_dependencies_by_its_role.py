"""An import-linter contract: each folder imports only the installed packages its role admits.

It reads the imports of the root packages' modules from the graph, which holds the installed
packages they import where `include_external_packages` is on, and reports an installed package
imported in a pure folder, imported outside the homes `homes` gives it, or imported with no home
outside the edge. The standard library, the root packages and the units `[tool.uv.sources]` of the
`pyproject.toml` beside the run links from the workspace count as the program's own code.

A home names `edge`, the whole edge; a folder of `module_layers`, that layer at the top of the
package and in every module of a folder `feature_form_layers` names; or another folder, that folder
at the top of the package. A file's role follows its layers: the folder at the top of the package
and, in a module of a folder `feature_form_layers` names, the folder below the module.
"""

import importlib.util
import re
import sys
import tomllib
from dataclasses import dataclass
from enum import StrEnum, unique
from pathlib import Path
from typing import TYPE_CHECKING, Final, override

from importlinter import Contract, ContractCheck, fields, output

if TYPE_CHECKING:
  from collections.abc import Iterator, Mapping

  from grimp import ImportGraph

SURFACE_STEM: Final = '__init__'
MODULE_ENTRY_STEM: Final = '__main__'
MODULE_SUFFIX: Final = '.py'
WHOLE_EDGE_HOME: Final = 'edge'
FEATURE_MODULE_DEPTH: Final = 2
EXTRA_ENTRY_DEPTH: Final = 2
PYPROJECT_FILE_NAME: Final = 'pyproject.toml'
HOMES_OPTION: Final = 'homes'
FINDINGS_KEY: Final = 'findings'
LIST_SEPARATOR: Final = ', '
PACKAGE_ROOT_LABEL: Final = 'the package root'
PACKAGE_IN_PURE: Final = '{folder} imports no package, and {package_name} is one'
PACKAGE_WITHOUT_HOME: Final = (
  '{package_name} has no home in {folder}; a package without one is imported at the edge'
)
PACKAGE_OUTSIDE_HOME: Final = '{package_name} is imported in {folder}, outside its home: {home}'
# Why: the build backend names the import package after the distribution, its separators folded.
DISTRIBUTION_SEPARATORS: Final = re.compile(r'[-.]+')


@unique
class _Role(StrEnum):
  PURE = 'pure'
  EDGE = 'edge'
  INNER = 'inner'


class _HomesField(fields.Field[dict[str, tuple[str, ...]]]):
  """A table of an installed package's import name to the list of the places it is imported."""

  @override
  def parse(self, raw_data: object) -> dict[str, tuple[str, ...]]:
    if not isinstance(raw_data, dict):
      message = 'Expected a table of a package to its list of homes.'

      raise fields.ValidationError(message)

    homes: dict[str, tuple[str, ...]] = {}

    for package_name, places in raw_data.items():
      if not isinstance(package_name, str) or not isinstance(places, list):
        message = f'Expected a list of homes for {package_name}.'

        raise fields.ValidationError(message)

      texts = tuple(place for place in places if isinstance(place, str))

      if len(texts) != len(places):
        message = f'Expected a list of homes for {package_name}.'

        raise fields.ValidationError(message)

      homes[package_name] = texts

    return homes


@dataclass(frozen=True, slots=True, kw_only=True)
class _Finding:
  path: Path
  line_number: int
  message: str


@dataclass(frozen=True, slots=True, kw_only=True)
class _SourceFile:
  module: str
  path: Path
  folder: tuple[str, ...]
  stem: str


@dataclass(frozen=True, slots=True, kw_only=True)
class _Layout:
  feature_form_layers: frozenset[str]
  pure_layers: frozenset[str]
  pure_module_layers: frozenset[str]
  edge_layers: frozenset[str]
  edge_module_layers: frozenset[str]
  module_layers: frozenset[str]
  entry: str
  extra_entry: str

  def layers_of(self, folder: tuple[str, ...]) -> tuple[str, ...]:
    is_feature_form = bool(folder) and folder[0] in self.feature_form_layers

    if not is_feature_form:
      return folder[:1]

    return (*folder[:1], *folder[FEATURE_MODULE_DEPTH : FEATURE_MODULE_DEPTH + 1])

  def is_entry(self, source_file: _SourceFile) -> bool:
    if not source_file.folder:
      return source_file.stem in {self.entry, MODULE_ENTRY_STEM}

    return (
      source_file.folder[0] == self.extra_entry
      and len(source_file.folder) == EXTRA_ENTRY_DEPTH
      and source_file.stem == self.entry
    )

  def role_of(self, source_file: _SourceFile) -> _Role:
    layers = self.layers_of(source_file.folder)
    module_layers = layers[1:]

    if layers and (
      layers[0] in self.pure_layers
      or (len(module_layers) == 1 and module_layers[0] in self.pure_module_layers)
    ):
      return _Role.PURE

    if (
      (layers and layers[0] in self.edge_layers)
      or (len(module_layers) == 1 and module_layers[0] in self.edge_module_layers)
      or self.is_entry(source_file)
    ):
      return _Role.EDGE

    return _Role.INNER

  def is_in_place(self, *, place: str, source_file: _SourceFile, role: _Role) -> bool:
    if place == WHOLE_EDGE_HOME:
      return role is _Role.EDGE

    layers = self.layers_of(source_file.folder)

    return layers[:1] == (place,) or (place in self.module_layers and layers[1:] == (place,))


def _label(folder: tuple[str, ...]) -> str:
  return '/'.join(folder) if folder else PACKAGE_ROOT_LABEL


def _import_name(distribution_name: str) -> str:
  return DISTRIBUTION_SEPARATORS.sub('_', distribution_name).lower()


def _workspace_import_names(pyproject_path: Path) -> frozenset[str]:
  if not pyproject_path.is_file():
    return frozenset[str]()

  with pyproject_path.open('rb') as pyproject_file:
    pyproject = tomllib.load(pyproject_file)

  uv_sources: object = pyproject.get('tool', {}).get('uv', {}).get('sources', {})

  if not isinstance(uv_sources, dict):
    return frozenset[str]()

  return frozenset(
    _import_name(distribution_name)
    for distribution_name, uv_source in uv_sources.items()
    if isinstance(distribution_name, str)
    and isinstance(uv_source, dict)
    and uv_source.get('workspace') is True
  )


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
    return _SourceFile(module=module, path=surface_path, folder=parts, stem=SURFACE_STEM)

  if not parts:
    return None

  file_path = package_path.joinpath(*parts[:-1], f'{parts[-1]}{MODULE_SUFFIX}')

  if not file_path.is_file():
    return None

  return _SourceFile(module=module, path=file_path, folder=parts[:-1], stem=parts[-1])


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
class _Importer:
  source_file: _SourceFile
  role: _Role
  layout: _Layout
  homes: Mapping[str, tuple[str, ...]]


def _message(*, importer: _Importer, package_name: str) -> str | None:
  folder = _label(importer.source_file.folder)
  home = importer.homes.get(package_name)

  # Why: a pure folder admits only a package a block gives a home there, such as a format
  # library's in the domain layer or the kernel.
  if importer.role is _Role.PURE and home is None:
    return PACKAGE_IN_PURE.format(folder=folder, package_name=package_name)

  if home is None:
    if importer.role is _Role.EDGE:
      return None

    return PACKAGE_WITHOUT_HOME.format(folder=folder, package_name=package_name)

  is_at_home = any(
    importer.layout.is_in_place(place=place, source_file=importer.source_file, role=importer.role)
    for place in home
  )

  if is_at_home:
    return None

  return PACKAGE_OUTSIDE_HOME.format(
    folder=folder, package_name=package_name, home=LIST_SEPARATOR.join(home)
  )


def _module_findings(
  *, graph: ImportGraph, importer: _Importer, own_names: frozenset[str]
) -> Iterator[_Finding]:
  module = importer.source_file.module

  for imported in sorted(graph.find_modules_directly_imported_by(module)):
    package_name = imported.split('.')[0]

    # Why: grimp records a relative import that climbs out of the import package as one of ''.
    if not package_name or package_name in own_names:
      continue

    message = _message(importer=importer, package_name=package_name)

    if message is None:
      continue

    for details in graph.get_import_details(importer=module, imported=imported):
      yield _Finding(
        path=importer.source_file.path, line_number=details['line_number'], message=message
      )


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


def _text_option(contract: Contract, name: str) -> str:
  value: object = vars(contract)[name]

  if not isinstance(value, str):
    raise TypeError(name)

  return value


def _homes_option(contract: Contract) -> Mapping[str, tuple[str, ...]]:
  value: object = vars(contract)[HOMES_OPTION]

  if not isinstance(value, dict):
    raise TypeError(HOMES_OPTION)

  return {
    package_name: tuple(place for place in places if isinstance(place, str))
    for package_name, places in value.items()
    if isinstance(package_name, str) and isinstance(places, tuple)
  }


class LayerImportsDependenciesByItsRoleContract(Contract):
  """Its options name the layers by their roles, and `homes` each installed package's homes."""

  feature_form_layers = fields.ListField(subfield=fields.StringField())
  pure_layers = fields.ListField(subfield=fields.StringField())
  pure_module_layers = fields.ListField(subfield=fields.StringField())
  edge_layers = fields.ListField(subfield=fields.StringField())
  edge_module_layers = fields.ListField(subfield=fields.StringField())
  module_layers = fields.ListField(subfield=fields.StringField())
  entry = fields.StringField()
  extra_entry = fields.StringField()
  homes = _HomesField(required=False, default={})

  @override
  def check(self, graph: ImportGraph, verbose: bool) -> ContractCheck:
    root_packages = self.session_options['root_packages']
    homes = _homes_option(self)
    layout = _Layout(
      feature_form_layers=_texts_option(self, 'feature_form_layers'),
      pure_layers=_texts_option(self, 'pure_layers'),
      pure_module_layers=_texts_option(self, 'pure_module_layers'),
      edge_layers=_texts_option(self, 'edge_layers'),
      edge_module_layers=_texts_option(self, 'edge_module_layers'),
      module_layers=_texts_option(self, 'module_layers'),
      entry=_text_option(self, 'entry'),
      extra_entry=_text_option(self, 'extra_entry'),
    )
    own_names = frozenset(
      {
        *root_packages,
        *sys.stdlib_module_names,
        *_workspace_import_names(Path.cwd() / PYPROJECT_FILE_NAME),
      }
    )
    findings = sorted(
      (
        finding
        for source_file in _source_files(graph=graph, root_packages=root_packages)
        for finding in _module_findings(
          graph=graph,
          importer=_Importer(
            source_file=source_file,
            role=layout.role_of(source_file),
            layout=layout,
            homes=homes,
          ),
          own_names=own_names,
        )
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
