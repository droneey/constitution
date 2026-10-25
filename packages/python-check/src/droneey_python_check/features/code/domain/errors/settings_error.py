from dataclasses import dataclass
from enum import StrEnum, unique


@unique
class Expected(StrEnum):
  TABLE = 'table'
  LIST_OF_TEXT = 'list-of-text'
  # a part `extend` names that is no file
  FILE = 'file'


@dataclass(frozen=True, slots=True, kw_only=True)
class Problem:
  # the file, as `extend` names it or pyproject.toml, and the dotted key in it
  file: str
  key: str
  expected: Expected


class SettingsError(ValueError):
  def __init__(self, problems: tuple[Problem, ...]) -> None:
    self.problems = problems
