from dataclasses import dataclass
from pathlib import Path
from typing import Final

from ...shared.entities import Layer
from ...shared.types import PackagePath

SOURCE_ROOT_NAME: Final = 'src'
FEATURE_FORM_LAYERS: Final = frozenset({Layer.COMPOSITION, Layer.FEATURES})
MODULE_DEPTH: Final = 2


@dataclass(frozen=True, slots=True, kw_only=True)
class ImportRoot:
  package_path: Path
  file_folder: PackagePath


def import_root_of(file_path: Path) -> ImportRoot | None:
  folder_names = file_path.parts[:-1]

  if SOURCE_ROOT_NAME not in folder_names:
    return None

  package_index = len(folder_names) - folder_names[::-1].index(SOURCE_ROOT_NAME)

  if package_index == len(folder_names):
    return None

  return ImportRoot(
    package_path=Path(*folder_names[: package_index + 1]),
    file_folder=PackagePath(folder_names[package_index + 1 :]),
  )


def in_feature_form(package_folder: PackagePath) -> bool:
  return bool(package_folder) and package_folder[0] in FEATURE_FORM_LAYERS


def module_of(package_folder: PackagePath) -> PackagePath:
  return PackagePath(package_folder[: MODULE_DEPTH if in_feature_form(package_folder) else 1])
