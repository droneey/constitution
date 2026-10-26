from enum import IntEnum, unique


@unique
class ExitStatus(IntEnum):
  PASSED = 0
  FAILED = 1
  # the check could not finish
  STOPPED = 2
