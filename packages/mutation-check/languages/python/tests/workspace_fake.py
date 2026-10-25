import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

from droneey_mutation_check.gate import Completed

if TYPE_CHECKING:
  from collections.abc import Mapping, Sequence

MUTMUT: tuple[str, ...] = (sys.executable, '-m', 'mutmut')
DIFF: tuple[str, ...] = (
  'git',
  'diff',
  '-U0',
  '--no-color',
  '--diff-filter=ACMR',
  '--merge-base',
  'origin/main',
  '--relative',
)
UNTRACKED: tuple[str, ...] = ('git', 'ls-files', '--others', '--exclude-standard')


@dataclass(kw_only=True)
class WorkspaceFake:
  # what each command answers; a command it does not know succeeds silently
  answers: Mapping[tuple[str, ...], Completed]
  files: Mapping[str, str]
  commands: list[tuple[str, ...]] = field(default_factory=list[tuple[str, ...]])
  cleared: int = 0

  def run(self, command: Sequence[str]) -> Completed:
    self.commands.append(tuple(command))

    return self.answers.get(tuple(command), Completed(status=0, output=''))

  def read(self, path: Path) -> str:
    return self.files[str(path)]

  def sources(self) -> tuple[Path, ...]:
    return tuple(Path(path) for path in self.files if path.startswith('src/'))

  def clear(self) -> None:
    self.cleared += 1
