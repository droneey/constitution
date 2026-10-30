import fnmatch
from dataclasses import dataclass
from typing import TYPE_CHECKING, NewType, assert_never

if TYPE_CHECKING:
  from ..mutant.mutant_entity import Mutant

MutantGlob = NewType('MutantGlob', str)


@dataclass(frozen=True, slots=True)
class EveryFunction:
  pass


@dataclass(frozen=True, slots=True, kw_only=True)
class Functions:
  globs: tuple[MutantGlob, ...]


type MutationTargets = EveryFunction | Functions


def is_empty(targets: MutationTargets) -> bool:
  return targets == Functions(globs=())


def covers(targets: MutationTargets, mutant: Mutant) -> bool:
  match targets:
    case EveryFunction():
      return True
    case Functions(globs=globs):
      return any(fnmatch.fnmatchcase(mutant.name, glob) for glob in globs)
    case _:  # pragma: no mutate -- no targets reach it
      assert_never(targets)  # pragma: no mutate -- no targets reach it
