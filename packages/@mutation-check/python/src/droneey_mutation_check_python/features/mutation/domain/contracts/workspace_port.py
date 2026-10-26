from dataclasses import dataclass
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
  from collections.abc import Sequence
  from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class Completed:
  status: int
  output: str


class Workspace(Protocol):
  def run(self, command: Sequence[str]) -> Completed: ...

  # runs a git command against a copy of the index that holds the paths as files to add, so git's
  # detection of moves sees them; the project's own index is never written
  def run_with_files_to_add(self, command: Sequence[str], paths: Sequence[str]) -> Completed: ...

  def read(self, path: Path) -> str: ...

  # every Python file under src/
  def sources(self) -> tuple[Path, ...]: ...

  # removes the mutants/ folder mutmut keeps between runs
  def clear(self) -> None: ...
