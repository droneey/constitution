from dataclasses import dataclass
from pathlib import Path
from typing import Final

from ..types import PackagePath
from .layer_entity import Layer

SOURCE_ROOT_NAME: Final = 'src'
# The layers whose modules take a feature's form, each module a folder of its own.
FEATURE_FORM_LAYERS: Final = frozenset({Layer.COMPOSITION, Layer.FEATURES})
# A module of that form is its layer's folder and its own: features/<f>, composition/<m>.
MODULE_DEPTH: Final = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportRoot:
  # src/<name>/
  path: Path
  file_folder: PackagePath


def import_root_of(file_path: Path) -> ImportRoot | None:
  folder_names = file_path.parts[:-1]

  if SOURCE_ROOT_NAME not in folder_names:
    return None

  package_index = len(folder_names) - folder_names[::-1].index(SOURCE_ROOT_NAME)

  if package_index == len(folder_names):
    return None

  return ImportRoot(
    path=Path(*folder_names[: package_index + 1]),
    file_folder=PackagePath(folder_names[package_index + 1 :]),
  )


def in_feature_form(package_folder: PackagePath) -> bool:
  return bool(package_folder) and package_folder[0] in FEATURE_FORM_LAYERS


def module_of(package_folder: PackagePath) -> PackagePath:
  """The module a folder belongs to.

  A module is a feature or a module of composition, elsewhere a top-level folder of the import
  package; a file that sits in the package itself belongs to its root, ().
  """
  return PackagePath(package_folder[: MODULE_DEPTH if in_feature_form(package_folder) else 1])
