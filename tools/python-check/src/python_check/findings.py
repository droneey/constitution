from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True, kw_only=True)
class Finding:
  path: Path
  line: int
  message: str


def render(finding: Finding) -> str:
  return f'{finding.path}:{finding.line}: {finding.message}'
