from dataclasses import dataclass
from enum import StrEnum, unique


@unique
class Pass(StrEnum):
  UNCHANGED = 'unchanged'
  KILLED = 'killed'
  # mutmut stopped before running: the changed functions hold no mutant
  EMPTY = 'empty'


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
