from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from .mutant_entity import Mutant
  from .outcome_entity import Broken


@dataclass(frozen=True, slots=True, kw_only=True)
class Ran:
  mutants: tuple[Mutant, ...]


@dataclass(frozen=True, slots=True, kw_only=True)
class Stopped:
  """mutmut stopped before running, as the functions it was given hold no mutant a spec reaches.

  It still lists the mutants it made.
  """

  mutants: tuple[Mutant, ...]


type MutationRun = Ran | Stopped | Broken
