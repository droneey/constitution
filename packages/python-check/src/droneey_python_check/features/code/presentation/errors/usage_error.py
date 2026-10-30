from enum import StrEnum, unique


@unique
class Misuse(StrEnum):
  NO_PATH = 'no-path'


class UsageError(Exception):
  code: Misuse

  def __init__(self, *, code: Misuse) -> None:
    self.code = code
