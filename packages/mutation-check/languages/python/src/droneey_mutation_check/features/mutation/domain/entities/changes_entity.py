from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from collections.abc import Callable, Mapping
  from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class Changes:
  # the lines each tracked file changed, from a diff against the base
  lines: Mapping[Path, tuple[range, ...]]
  untracked: tuple[Path, ...]
  # every Python file under src/
  sources: tuple[Path, ...]
  read: Callable[[Path], str]
