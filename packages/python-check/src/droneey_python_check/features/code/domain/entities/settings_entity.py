from collections.abc import Mapping
from dataclasses import dataclass, field

from .layer_entity import Layer


@dataclass(frozen=True, slots=True)
class WholeEdge:
  """Every folder of the edge, wherever it sits, as one place of a home."""


@dataclass(frozen=True, slots=True, kw_only=True)
class TopLevelFolder:
  """A top-level folder of the import package that core's tree does not name."""

  name: str


# A place a package is imported in: a layer, wherever the tree puts it, a top-level folder of the
# project's own, or the whole edge.
type HomePlace = Layer | TopLevelFolder | WholeEdge
type Homes = Mapping[str, tuple[HomePlace, ...]]


@dataclass(frozen=True, slots=True, kw_only=True)
class Settings:
  homes_by_import_name: Homes = field(default_factory=dict)
  workspace_unit_import_names: frozenset[str] = frozenset()
