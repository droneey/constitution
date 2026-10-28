from dataclasses import dataclass
from enum import StrEnum, unique
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from .mutant_entity import Mutant


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
