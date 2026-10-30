from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ...types import PackagePath
  from ..settings.settings_entity import HomePlace


@dataclass(frozen=True, slots=True, kw_only=True)
class Unparsable:
  parser_message: str


@dataclass(frozen=True, slots=True, kw_only=True)
class LongFile:
  line_count: int
  limit: int


@dataclass(frozen=True, slots=True, kw_only=True)
class LongFunction:
  function_name: str
  line_count: int
  limit: int


@dataclass(frozen=True, slots=True)
class ImportClimbingOut:
  pass


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportLeavingModule:
  importer_module: PackagePath


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportOfItself:
  imported_name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class PackageInPure:
  folder: PackagePath
  package_name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class PackageWithoutHome:
  folder: PackagePath
  package_name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class PackageOutsideHome:
  folder: PackagePath
  package_name: str
  home: tuple[HomePlace, ...]


@dataclass(frozen=True, slots=True, kw_only=True)
class EffectOutsideEdge:
  folder: PackagePath
  effect_dotted_name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class EnvironmentOutsideRoot:
  folder: PackagePath
  environment_name: str


type Breach = (
  Unparsable
  | LongFile
  | LongFunction
  | ImportClimbingOut
  | ImportLeavingModule
  | ImportOfItself
  | PackageInPure
  | PackageWithoutHome
  | PackageOutsideHome
  | EffectOutsideEdge
  | EnvironmentOutsideRoot
)
