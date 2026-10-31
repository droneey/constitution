from typing import TYPE_CHECKING

from .....domain.file_findings.services import file_findings

if TYPE_CHECKING:
  from .....domain.finding.entities import Finding
  from .....domain.settings.entities import Settings
  from .....domain.source.entities import Sources


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
