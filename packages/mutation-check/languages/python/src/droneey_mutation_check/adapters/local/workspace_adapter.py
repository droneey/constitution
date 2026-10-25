import shutil
import subprocess
from dataclasses import dataclass
from typing import TYPE_CHECKING, Final

from droneey_mutation_check.check_error import CheckError, Failure
from droneey_mutation_check.gate import Completed
from droneey_mutation_check.targets import SOURCE_ROOT

if TYPE_CHECKING:
  from collections.abc import Mapping, Sequence
  from pathlib import Path

MUTANTS: Final = 'mutants'
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

  def read(self, path: Path) -> str:
    file = self.folder / path

    return file.read_text(encoding=UTF_8)  # pragma: no mutate -- the specs' locale is UTF-8 too

  def sources(self) -> tuple[Path, ...]:
    return tuple(
      sorted(path.relative_to(self.folder) for path in (self.folder / SOURCE_ROOT).rglob('*.py'))
    )

  def clear(self) -> None:
    shutil.rmtree(self.folder / MUTANTS, ignore_errors=True)
