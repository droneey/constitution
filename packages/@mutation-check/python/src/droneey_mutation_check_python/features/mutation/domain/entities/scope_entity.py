from enum import StrEnum, unique


@unique
class Scope(StrEnum):
  """The functions a check mutates: those the branch changed, or all of them."""

  CHANGED = 'changed'
  ALL = 'all'
