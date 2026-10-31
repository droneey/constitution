from dataclasses import dataclass


@dataclass(frozen=True, slots=True, kw_only=True)
class CommandResult:
  exit_code: int
  joined_output: str
