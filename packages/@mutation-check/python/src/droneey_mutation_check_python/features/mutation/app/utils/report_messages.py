from typing import Final

NOTHING_CHANGED: Final = 'no function to mutate changed'
EVERY_MUTANT_KILLED: Final = 'every mutant killed'
NOTHING_TO_MUTATE: Final = 'the functions hold nothing to mutate'

COMMAND_FAILED: Final = '{command} failed: {output}'
COMMAND_NOT_RUN: Final = '{command} did not start; put it on PATH'
COMMAND_TIMED_OUT: Final = '{command} ran past its time'
MUTANTS_KEPT: Final = (
  'the mutants/ folder of an earlier run could not be removed, {reason}; remove it and run again'
)
# git and mutmut never write a value the check refuses, so one is a defect
ABSOLUTE_PATH: Final = '{text} is absolute where a path from the unit belongs; report it'
PATH_OUT_OF_UNIT: Final = '{text} climbs out of the unit where a path from it belongs; report it'
UNKNOWN_ARGUMENTS: Final = (
  '{arguments} is no argument the check takes; run it with none to mutate the changed functions,'
  ' or with {all_argument} to mutate all of them'
)
OWN_ERROR: Final = 'the check stopped on an error of its own, {error!r}; report it'
