from enum import IntEnum, unique


@unique
class ExitStatus(IntEnum):
  PASSED = 0
  FAILED = 1
  USAGE = 2
  SETTINGS = 3
  DEFECT = 4
