from enum import StrEnum, unique


@unique
class Misuse(StrEnum):
  NO_PATH = 'no-path'
  # a path that is neither a file nor a folder
  MISSING_PATH = 'missing-path'


class UsageError(Exception):
  def __init__(self, *, code: Misuse, paths: tuple[str, ...] = ()) -> None:
    self.code = code
    self.paths = paths
