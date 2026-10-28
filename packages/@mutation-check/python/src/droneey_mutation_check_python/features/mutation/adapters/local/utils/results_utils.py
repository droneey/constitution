import re
from types import MappingProxyType
from typing import TYPE_CHECKING, Final

from ....domain.entities import Mutant, MutantName, MutantStatus

if TYPE_CHECKING:
  from collections.abc import Mapping

# a line of `mutmut results`: a mutant's name and its status
RESULT_PATTERN: Final = re.compile(r'^\s+(?P<name>\S+): (?P<status>.+)$', re.MULTILINE)
# each status mutmut writes, which MutantStatus spells as mutmut does, in a view nothing can change;
# one a later mutmut adds reads as unknown
STATUSES: Final[Mapping[str, MutantStatus]] = MappingProxyType(
  {status.value: status for status in MutantStatus if status is not MutantStatus.UNKNOWN}
)


def read_mutants(results_output: str) -> tuple[Mutant, ...]:
  return tuple(
    Mutant(
      name=MutantName(result['name']), status=STATUSES.get(result['status'], MutantStatus.UNKNOWN)
    )
    for result in RESULT_PATTERN.finditer(results_output)
  )
