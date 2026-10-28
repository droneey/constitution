from dataclasses import dataclass
from typing import NewType

# A pattern of mutmut's over the names of a function's mutants: `shop.orders.x_total__mutmut_*`.
MutantGlob = NewType('MutantGlob', str)


@dataclass(frozen=True, slots=True)
class EveryFunction:
  """Every function of the unit's sources."""


@dataclass(frozen=True, slots=True, kw_only=True)
class Functions:
  globs: tuple[MutantGlob, ...]


type MutationTargets = EveryFunction | Functions
