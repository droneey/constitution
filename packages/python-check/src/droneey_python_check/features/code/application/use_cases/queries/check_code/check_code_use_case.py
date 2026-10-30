from typing import TYPE_CHECKING

from .....domain.services import file_findings

if TYPE_CHECKING:
  from .....domain.entities import Finding, Settings, Sources


def check_code(
  *, sources: Sources, settings: Settings, standard_module_names: frozenset[str]
) -> tuple[Finding, ...]:
  return tuple(
    finding
    for source in sources.files
    for finding in file_findings(
      source=source,
      package_folder_paths=sources.package_folder_paths,
      settings=settings,
      standard_module_names=standard_module_names,
    )
  )
