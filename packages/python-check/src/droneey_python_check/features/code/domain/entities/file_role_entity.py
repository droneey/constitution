from enum import StrEnum, unique
from typing import TYPE_CHECKING, Final, assert_never

from .import_root_entity import in_feature_form
from .layer_entity import Layer

if TYPE_CHECKING:
  from ..types import PackagePath

# The kernel, the ports it shares among it, is pure, and so is a domain.
PURE_LAYERS: Final = frozenset({Layer.KERNEL})
EDGE_LAYERS: Final = frozenset({Layer.ADAPTERS, Layer.INTEGRATIONS, Layer.LIBS, Layer.ROOT})
MAIN_STEM: Final = 'main'
ENTRY_STEMS: Final = frozenset({'__main__', MAIN_STEM})
# The folders of an entry file of its own: entrypoints/<name>/main.py.
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
  """The layers a file sits in, by its folder inside the import package.

  They are its top-level folder and, in a feature or a module of composition, that module's layer,
  its third folder.
  """
  return (*file_folder[:1], *file_folder[2:3]) if in_feature_form(file_folder) else file_folder[:1]


def role_of(*, file_folder: PackagePath, file_stem: str) -> FileRole:
  """The role of a file; a top-level folder the tree does not name is no part of the edge."""
  layers = layers_of(file_folder)

  if layers and (layers[0] in PURE_LAYERS or layers[1:] == (Layer.DOMAIN,)):
    return FileRole.PURE

  if (
    (layers and layers[0] in EDGE_LAYERS)
    or layers[1:] == (Layer.ADAPTERS,)
    or is_entry(file_folder=file_folder, file_stem=file_stem)
  ):
    return FileRole.EDGE

  return FileRole.INNER


def is_edge(role: FileRole) -> bool:
  """Whether the role is the edge's, the one that reaches effects and the environment."""
  match role:
    case FileRole.EDGE:
      return True
    case FileRole.PURE | FileRole.INNER:
      return False
    case _:  # pragma: no mutate -- no role reaches it
      assert_never(role)  # pragma: no mutate -- no role reaches it


def may_import_packages(role: FileRole) -> bool:
  """Whether a file of the role may import a package in its home, which no pure file does."""
  match role:
    case FileRole.EDGE | FileRole.INNER:
      return True
    case FileRole.PURE:
      return False
    case _:  # pragma: no mutate -- no role reaches it
      assert_never(role)  # pragma: no mutate -- no role reaches it


def is_binding_unit(file_folder: PackagePath) -> bool:
  return layers_of(file_folder)[1:] == (Layer.APP,)
