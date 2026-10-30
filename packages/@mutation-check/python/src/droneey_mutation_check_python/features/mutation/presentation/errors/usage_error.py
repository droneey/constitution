from enum import StrEnum, unique


@unique
class Misuse(StrEnum):
  UNKNOWN_ARGUMENTS = 'unknown-arguments'


class UsageError(Exception):
  code: Misuse
  arguments: tuple[str, ...]

  def __init__(self, *, code: Misuse, arguments: tuple[str, ...]) -> None:
    self.code = code
    self.arguments = arguments
