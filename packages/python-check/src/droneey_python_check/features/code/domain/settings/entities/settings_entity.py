from collections.abc import Mapping
from dataclasses import dataclass, field

from ...shared.entities import Layer


@dataclass(frozen=True, slots=True)
class WholeEdge:
  pass


@dataclass(frozen=True, slots=True, kw_only=True)
class TopLevelFolder:
  name: str


type HomePlace = Layer | TopLevelFolder | WholeEdge
type Homes = Mapping[str, tuple[HomePlace, ...]]


@dataclass(frozen=True, slots=True, kw_only=True)
class Settings:
  homes_by_import_name: Homes = field(default_factory=dict)
  workspace_unit_import_names: frozenset[str] = frozenset()
