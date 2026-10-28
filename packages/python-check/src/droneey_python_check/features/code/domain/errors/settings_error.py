from dataclasses import dataclass
from enum import StrEnum, unique


@unique
class Expected(StrEnum):
  TABLE = 'table'
  LIST_OF_TEXT = 'list-of-text'


@dataclass(frozen=True, slots=True, kw_only=True)
class WrongShape:
  file_path: str
  dotted_key: str
  expected: Expected


@dataclass(frozen=True, slots=True, kw_only=True)
class UnknownKey:
  """A key of python-check's own table, or of a part, that the check does not read."""

  file_path: str
  dotted_key: str


@dataclass(frozen=True, slots=True, kw_only=True)
class MissingPart:
  """A part `extend` names that is no file."""

  file_path: str


@dataclass(frozen=True, slots=True, kw_only=True)
class MalformedFile:
  file_path: str
  parser_message: str


# Each problem names its file as `extend` names it, or pyproject.toml.
type Problem = WrongShape | UnknownKey | MissingPart | MalformedFile


class SettingsError(ValueError):
  problems: tuple[Problem, ...]

  def __init__(self, problems: tuple[Problem, ...]) -> None:
    self.problems = problems
