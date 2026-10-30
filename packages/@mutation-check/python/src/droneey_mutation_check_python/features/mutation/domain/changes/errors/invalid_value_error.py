from enum import StrEnum, unique


@unique
class ValueFailure(StrEnum):
  ABSOLUTE_PATH = 'absolute-path'
  PATH_OUT_OF_UNIT = 'path-out-of-unit'


class InvalidValueError(ValueError):
  code: ValueFailure
  text: str

  def __init__(self, *, code: ValueFailure, text: str) -> None:
    self.code = code
    self.text = text
