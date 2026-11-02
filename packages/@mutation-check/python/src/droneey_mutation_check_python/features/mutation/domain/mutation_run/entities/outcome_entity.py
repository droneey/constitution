from dataclasses import dataclass
from enum import StrEnum, unique
from typing import TYPE_CHECKING, assert_never

from ...mutant.entities import is_killed
from ...mutation_targets.entities import covers
from .mutation_run_entity import Ran, Stopped

if TYPE_CHECKING:
  from ...mutant.entities import Mutant
  from ...mutation_targets.entities import MutationTargets
  from .mutation_run_entity import MutationRun


@unique
class PassReason(StrEnum):
  UNCHANGED = 'unchanged'
  KILLED = 'killed'
  NOTHING_TO_MUTATE = 'nothing-to-mutate'


@dataclass(frozen=True, slots=True, kw_only=True)
class Passed:
  reason: PassReason


@dataclass(frozen=True, slots=True, kw_only=True)
class Survived:
  mutants: tuple[Mutant, ...]


@dataclass(frozen=True, slots=True, kw_only=True)
class Broken:
  output: str


type Outcome = Passed | Survived | Broken


def _targeted(mutants: tuple[Mutant, ...], targets: MutationTargets) -> tuple[Mutant, ...]:
  return tuple(mutant for mutant in mutants if covers(targets, mutant))


def outcome_of(run: MutationRun, targets: MutationTargets) -> Outcome:
  match run:
    case Broken():
      return run
    case Ran(mutants=mutants):
      not_killed = tuple(
        mutant for mutant in _targeted(mutants, targets) if not is_killed(mutant.status)
      )
      reason = PassReason.KILLED
    case Stopped(mutants=mutants):
      not_killed = _targeted(mutants, targets)
      reason = PassReason.NOTHING_TO_MUTATE
    case _:  # pragma: no mutate -- no run reaches it
      assert_never(run)  # pragma: no mutate -- no run reaches it

  if not_killed:
    return Survived(mutants=not_killed)

  return Passed(reason=reason)
