from collections.abc import Mapping
from dataclasses import dataclass, field

type Homes = Mapping[str, tuple[str, ...]]


@dataclass(frozen=True, slots=True, kw_only=True)
class Settings:
  # each package with a home, by its import name, and the folders it is imported in
  homes: Homes = field(default_factory=dict)
  # the import names of the workspace's own units, which are the repository's code
  units: frozenset[str] = frozenset()
