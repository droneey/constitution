from dataclasses import dataclass
from enum import IntEnum, StrEnum, unique
from typing import Final, assert_never


@unique
class Pass(StrEnum):
  UNCHANGED = 'unchanged'
  KILLED = 'killed'
  # mutmut stopped before running: the changed functions hold no mutant
  EMPTY = 'empty'


@unique
class ExitStatus(IntEnum):
  PASSED = 0
  FAILED = 1
  # the check could not finish
  STOPPED = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class Mutant:
  name: str
  status: str


@dataclass(frozen=True, slots=True, kw_only=True)
class Passed:
  why: Pass


@dataclass(frozen=True, slots=True, kw_only=True)
class Survived:
  mutants: tuple[Mutant, ...]


# mutmut failed before it ran the mutants, with what it printed.
@dataclass(frozen=True, slots=True, kw_only=True)
class Broken:
  output: str


type Outcome = Passed | Survived | Broken

# Each line of the report opens with its code, `mutation: <code>: `, which a reader scripts against.
NOT_KILLED: Final = 'not-killed'
PASSES: Final = {
  Pass.UNCHANGED: 'no function to mutate changed',
  Pass.KILLED: 'every mutant killed',
  Pass.EMPTY: 'the functions hold nothing to mutate',
}


def render(outcome: Outcome) -> str:
  match outcome:
    case Passed(why=why):
      return f'mutation: {why}: {PASSES[why]}\n'
    case Survived(mutants=mutants):
      return ''.join(
        f'mutation: {NOT_KILLED}: {mutant.name}: {mutant.status}\n' for mutant in mutants
      )
    case Broken(output=output):
      return output
    case _:  # pragma: no mutate -- no outcome reaches it
      assert_never(outcome)  # pragma: no mutate -- no outcome reaches it


def exit_status(outcome: Outcome) -> ExitStatus:
  return ExitStatus.PASSED if isinstance(outcome, Passed) else ExitStatus.FAILED
