import re
from types import MappingProxyType
from typing import TYPE_CHECKING, Final

from ....domain.mutant.entities import Mutant, MutantName, MutantStatus

if TYPE_CHECKING:
  from collections.abc import Mapping

RESULTS_LINE_PATTERN: Final = re.compile(r'^\s+(?P<name>\S+): (?P<status>.+)$', re.MULTILINE)
STATUSES: Final[Mapping[str, MutantStatus]] = MappingProxyType(
  {status.value: status for status in MutantStatus if status is not MutantStatus.UNKNOWN}
)


def read_mutants(results_output: str) -> tuple[Mutant, ...]:
  return tuple(
    Mutant(
      name=MutantName(result['name']), status=STATUSES.get(result['status'], MutantStatus.UNKNOWN)
    )
    for result in RESULTS_LINE_PATTERN.finditer(results_output)
  )
