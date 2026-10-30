from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ...mutant.entities import Mutant
  from .outcome_entity import Broken


@dataclass(frozen=True, slots=True, kw_only=True)
class Ran:
  mutants: tuple[Mutant, ...]


# Why: mutmut stops before running when the functions it was given hold no mutant a spec reaches,
# and still lists the mutants it made.
@dataclass(frozen=True, slots=True, kw_only=True)
class Stopped:
  mutants: tuple[Mutant, ...]


type MutationRun = Ran | Stopped | Broken
