from dataclasses import dataclass
from enum import StrEnum, unique
from typing import NewType, assert_never

MutantName = NewType('MutantName', str)


@unique
class MutantStatus(StrEnum):
  KILLED = 'killed'
  CAUGHT_BY_TYPE_CHECK = 'caught by type check'
  SKIPPED = 'skipped'
  NOT_CHECKED = 'not checked'
  SURVIVED = 'survived'
  NO_TESTS = 'no tests'
  TIMEOUT = 'timeout'
  SUSPICIOUS = 'suspicious'
  SEGFAULT = 'segfault'
  INTERRUPTED = 'check was interrupted by user'
  UNKNOWN = 'unknown'


@dataclass(frozen=True, slots=True, kw_only=True)
class Mutant:
  name: MutantName
  status: MutantStatus


def is_killed(status: MutantStatus) -> bool:
  match status:
    case (
      MutantStatus.KILLED
      | MutantStatus.CAUGHT_BY_TYPE_CHECK
      | MutantStatus.SKIPPED
      | MutantStatus.NOT_CHECKED
    ):
      return True
    case (
      MutantStatus.SURVIVED
      | MutantStatus.NO_TESTS
      | MutantStatus.TIMEOUT
      | MutantStatus.SUSPICIOUS
      | MutantStatus.SEGFAULT
      | MutantStatus.INTERRUPTED
      | MutantStatus.UNKNOWN
    ):
      return False
    case _:  # pragma: no mutate -- no status reaches it
      assert_never(status)  # pragma: no mutate -- no status reaches it
