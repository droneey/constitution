from dataclasses import dataclass
from typing import NewType

MutantGlob = NewType('MutantGlob', str)


@dataclass(frozen=True, slots=True)
class EveryFunction:
  pass


@dataclass(frozen=True, slots=True, kw_only=True)
class Functions:
  globs: tuple[MutantGlob, ...]


type MutationTargets = EveryFunction | Functions
