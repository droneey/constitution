from dataclasses import dataclass
from enum import StrEnum, unique
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from pathlib import Path


@unique
class Rule(StrEnum):
  SYNTAX = 'syntax'
  FILE_LINES = 'file-lines'
  FUNCTION_LINES = 'function-lines'
  IMPORT_CLIMBS_OUT = 'import-climbs-out'
  IMPORT_LEAVES_MODULE = 'import-leaves-module'
  IMPORT_OF_ITSELF = 'import-of-itself'
  PACKAGE_IN_PURE = 'package-in-pure'
  PACKAGE_WITHOUT_HOME = 'package-without-home'
  PACKAGE_OUTSIDE_HOME = 'package-outside-home'
  EFFECT_OUTSIDE_EDGE = 'effect-outside-edge'
  ENVIRONMENT_OUTSIDE_ROOT = 'environment-outside-root'


@dataclass(frozen=True, slots=True, kw_only=True)
class Finding:
  path: Path
  line: int
  rule: Rule
  # what the finding names, in the order its message names them
  values: tuple[str, ...] = ()
