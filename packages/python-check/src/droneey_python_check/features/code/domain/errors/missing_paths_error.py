from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from pathlib import Path


class MissingPathsError(ValueError):
  """Paths to check that are neither a file nor a folder."""

  paths: tuple[Path, ...]

  def __init__(self, paths: tuple[Path, ...]) -> None:
    self.paths = paths
