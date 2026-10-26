import shutil
import subprocess
import tempfile
from dataclasses import dataclass, replace
from pathlib import Path
from typing import TYPE_CHECKING, Final

from ...domain.constants import SOURCE_ROOT
from ...domain.contracts import Completed
from ...domain.errors import CheckError, Failure

if TYPE_CHECKING:
  from collections.abc import Mapping, Sequence

MUTANTS: Final = 'mutants'
INDEX: Final = ('git', 'rev-parse', '--path-format=absolute', '--git-path', 'index')
INDEX_COPY: Final = 'index'
ADD_INTENT: Final = ('git', 'add', '--intent-to-add', '--')
# a constant, since mutmut would spell the codec's name in capitals, which names the same codec
UTF_8: Final = 'utf-8'


@dataclass(frozen=True, slots=True, kw_only=True)
class WorkspaceAdapter:
  folder: Path
  environment: Mapping[str, str]
  timeout_seconds: float

  def run(self, command: Sequence[str]) -> Completed:
    try:
      completed = subprocess.run(  # noqa: S603 -- the commands are git's and mutmut's, built by the gate
        command,
        capture_output=True,
        check=True,
        cwd=self.folder,
        encoding=UTF_8,
        env=self.environment,
        timeout=self.timeout_seconds,
      )
    except subprocess.CalledProcessError as error:
      return Completed(status=error.returncode, output=error.stdout + error.stderr)
    except subprocess.TimeoutExpired as error:
      raise CheckError(code=Failure.TIMED_OUT, command=command) from error
    except OSError as error:
      raise CheckError(code=Failure.NOT_RUN, command=command) from error

    return Completed(status=0, output=completed.stdout + completed.stderr)

  def run_with_files_to_add(self, command: Sequence[str], paths: Sequence[str]) -> Completed:
    index = self.run(INDEX)

    if index.status != 0:
      return index

    with tempfile.TemporaryDirectory() as scratch:
      copy = Path(scratch) / INDEX_COPY
      # the copy keeps the index's time: git checks again the text of a file written in the second
      # the index was, which a newer copy would let it take for unchanged
      shutil.copy2(index.output.strip(), copy)
      indexed = replace(self, environment={**self.environment, 'GIT_INDEX_FILE': str(copy)})
      added = indexed.run([*ADD_INTENT, *paths])

      return added if added.status != 0 else indexed.run(command)

  def read(self, path: Path) -> str:
    file = self.folder / path

    return file.read_text(encoding=UTF_8)  # pragma: no mutate -- the specs' locale is UTF-8 too

  def sources(self) -> tuple[Path, ...]:
    return tuple(
      sorted(path.relative_to(self.folder) for path in (self.folder / SOURCE_ROOT).rglob('*.py'))
    )

  def clear(self) -> None:
    shutil.rmtree(self.folder / MUTANTS, ignore_errors=True)
