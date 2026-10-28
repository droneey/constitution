from enum import StrEnum, unique


@unique
class Scope(StrEnum):
  CHANGED = 'changed'
  ALL = 'all'
