from enum import StrEnum, unique
from typing import TYPE_CHECKING, Final, assert_never

from ..import_root.import_root_entity import in_feature_form
from ..layer.layer_entity import Layer

if TYPE_CHECKING:
  from ...types import PackagePath

PURE_TOP_LEVEL_LAYERS: Final = frozenset({Layer.KERNEL})
PURE_MODULE_LAYERS: Final = frozenset({(Layer.DOMAIN,), (Layer.APPLICATION,)})
EDGE_LAYERS: Final = frozenset({Layer.INFRASTRUCTURE, Layer.INTEGRATIONS, Layer.LIBS, Layer.ROOT})
MAIN_STEM: Final = 'main'
ENTRY_STEMS: Final = frozenset({'__main__', MAIN_STEM})
ENTRY_DEPTH: Final = 2


@unique
class FileRole(StrEnum):
  PURE = 'pure'
  EDGE = 'edge'
  INNER = 'inner'


def is_entry(*, file_folder: PackagePath, file_stem: str) -> bool:
  return (not file_folder and file_stem in ENTRY_STEMS) or (
    file_folder[:1] == (Layer.ENTRYPOINTS,)
    and len(file_folder) == ENTRY_DEPTH
    and file_stem == MAIN_STEM
  )


def layers_of(file_folder: PackagePath) -> tuple[str, ...]:
  top_level_folder = file_folder[:1]
  module_layer_folder = file_folder[2:3]

  return (
    (*top_level_folder, *module_layer_folder) if in_feature_form(file_folder) else top_level_folder
  )


def role_of(*, file_folder: PackagePath, file_stem: str) -> FileRole:
  layers = layers_of(file_folder)

  if layers and (layers[0] in PURE_TOP_LEVEL_LAYERS or layers[1:] in PURE_MODULE_LAYERS):
    return FileRole.PURE

  if (
    (layers and layers[0] in EDGE_LAYERS)
    or layers[1:] == (Layer.INFRASTRUCTURE,)
    or is_entry(file_folder=file_folder, file_stem=file_stem)
  ):
    return FileRole.EDGE

  return FileRole.INNER


def is_edge(role: FileRole) -> bool:
  match role:
    case FileRole.EDGE:
      return True
    case FileRole.PURE | FileRole.INNER:
      return False
    case _:  # pragma: no mutate -- no role reaches it
      assert_never(role)  # pragma: no mutate -- no role reaches it


def may_import_packages(role: FileRole) -> bool:
  match role:
    case FileRole.EDGE | FileRole.INNER:
      return True
    case FileRole.PURE:
      return False
    case _:  # pragma: no mutate -- no role reaches it
      assert_never(role)  # pragma: no mutate -- no role reaches it


def is_binding_unit(file_folder: PackagePath) -> bool:
  return layers_of(file_folder)[1:] == (Layer.PRESENTATION,)
