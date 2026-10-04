import io
import sys
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path

from mutmut_check.gate import Completed, Workspace

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
class RunnerFake:
  # what each command answers; a command it does not know succeeds silently
  answers: Mapping[tuple[str, ...], Completed]
  commands: list[tuple[str, ...]] = field(default_factory=list[tuple[str, ...]])
  cleared: int = 0

  def run(self, command: Sequence[str]) -> Completed:
    self.commands.append(tuple(command))

    return self.answers.get(tuple(command), Completed(status=0, output=''))

  def clear(self) -> None:
    self.cleared += 1


def workspace_of(*, runner: RunnerFake, files: Mapping[str, str], output: io.StringIO) -> Workspace:
  return Workspace(
    run=runner.run,
    read=lambda path: files[str(path)],
    sources=lambda: tuple(Path(path) for path in files if path.startswith('src/')),
    clear=runner.clear,
    output=output,
  )
