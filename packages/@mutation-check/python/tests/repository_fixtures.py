import os
import subprocess
from typing import TYPE_CHECKING, Final

from changes_fixtures import python

if TYPE_CHECKING:
  from collections.abc import Mapping
  from pathlib import Path

# git run by the specs reads no configuration of the machine's user
GIT_ENVIRONMENT: Final = {'PATH': os.environ['PATH'], 'GIT_CONFIG_NOSYSTEM': '1'}


def write_files(folder_path: Path, texts: Mapping[str, str]) -> None:
  for file_path, text in texts.items():
    (folder_path / file_path).parent.mkdir(parents=True, exist_ok=True)
    (folder_path / file_path).write_text(text, encoding='utf-8')


def git(repository_path: Path, *arguments: str) -> None:
  subprocess.run(  # noqa: S603 -- git with the spec's own arguments
    ['git', '-c', 'user.name=Spec', '-c', 'user.email=spec@example.com', *arguments],  # noqa: S607 -- git from PATH, as the gate runs it
    check=True,
    capture_output=True,
    cwd=repository_path,
    env=GIT_ENVIRONMENT,
  )


def repository(repository_path: Path, texts: Mapping[str, str]) -> None:
  """A repository whose base, origin/main, holds the files given."""
  write_files(repository_path, texts)
  git(repository_path, 'init', '--quiet')
  git(repository_path, 'add', '.')
  git(repository_path, 'commit', '--quiet', '--no-verify', '-m', 'base')
  git(repository_path, 'update-ref', 'refs/remotes/origin/main', 'HEAD')


def moved_unit(repository_path: Path) -> Path:
  """A repository whose branch moved a file into the unit it answers, without telling git yet."""
  repository(repository_path, {'packages/old/money.py': python('LIMIT = 1', 'RATE = 2', 'TAX = 3')})
  (repository_path / 'packages/shop').mkdir()
  (repository_path / 'packages/old/money.py').rename(repository_path / 'packages/shop/money.py')

  return repository_path / 'packages/shop'
