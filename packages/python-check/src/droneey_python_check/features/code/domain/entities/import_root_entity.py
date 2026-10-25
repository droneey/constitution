from dataclasses import dataclass
from pathlib import Path
from typing import Final

SOURCE_ROOT: Final = 'src'
# The layers whose modules take a feature's form, each module a folder of its own.
FEATURE_FORM: Final = frozenset({'composition', 'features'})
# A module of that form is its layer's folder and its own: features/<f>, composition/<m>.
MODULE_DEPTH: Final = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportRoot:
  # the folder of the import package, src/<name>/
  folder: Path
  # the importing file's folder, relative to the import package
  package: tuple[str, ...]
  # every folder of the import package, read at the edge
  folders: frozenset[Path] = frozenset()


def import_root_of(path: Path, *, folders: frozenset[Path] = frozenset()) -> ImportRoot | None:
  parts = path.parts[:-1]

  if SOURCE_ROOT not in parts:
    return None

  start = len(parts) - parts[::-1].index(SOURCE_ROOT)

  if start == len(parts):
    return None

  return ImportRoot(
    folder=Path(*parts[: start + 1]),
    package=parts[start + 1 :],
    folders=folders,
  )


def in_feature_form(folder: tuple[str, ...]) -> bool:
  return bool(folder) and folder[0] in FEATURE_FORM


# A module is a feature or a module of composition, elsewhere a top-level folder
# of the import package; a file that sits in the package itself belongs to its root, ().
def module_of(folder: tuple[str, ...]) -> tuple[str, ...]:
  return folder[: MODULE_DEPTH if in_feature_form(folder) else 1]
