from pathlib import PurePosixPath
from typing import Final

from ..value_objects import UnitRelativePath

SOURCE_ROOT_PATH: Final = UnitRelativePath(path=PurePosixPath('src'))
