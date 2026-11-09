from dataclasses import dataclass
from enum import StrEnum, unique


@unique
class Expected(StrEnum):
  TABLE = 'table'
  LIST_OF_TEXT = 'list-of-text'


@dataclass(frozen=True, slots=True, kw_only=True)
class WrongShape:
  path_from_unit: str
  dotted_key: str
  expected: Expected


@dataclass(frozen=True, slots=True, kw_only=True)
class UnknownKey:
  path_from_unit: str
  dotted_key: str


@dataclass(frozen=True, slots=True, kw_only=True)
class MissingPart:
  path_from_unit: str


@dataclass(frozen=True, slots=True, kw_only=True)
class MalformedFile:
  path_from_unit: str
  parser_message: str


type Problem = WrongShape | UnknownKey | MissingPart | MalformedFile


class SettingsError(ValueError):
  problems: tuple[Problem, ...]

  def __init__(self, problems: tuple[Problem, ...]) -> None:
    self.problems = problems
