from typing import Final

from ...domain.entities import Finding, Rule
from ..constants import ExitStatus

# What each rule's finding says, the values it names filled in by their order.
MESSAGES: Final = {
  Rule.SYNTAX: 'the file does not parse: {0}',
  Rule.FILE_LINES: 'the file holds {0} lines, more than {1}',
  Rule.FUNCTION_LINES: '{0} holds {1} lines, more than {2}',
  Rule.IMPORT_CLIMBS_OUT: 'a relative import climbs out of the import package',
  Rule.IMPORT_LEAVES_MODULE: (
    'a relative import leaves its module, {0}; import it by its absolute path'
  ),
  Rule.IMPORT_OF_ITSELF: 'a module imports itself by its absolute path, {0}; import it relatively',
  Rule.PACKAGE_IN_PURE: '{0} imports no package, and {1} is one',
  Rule.PACKAGE_WITHOUT_HOME: (
    '{0} has no home in {1}; a package without one is imported at the edge'
  ),
  Rule.PACKAGE_OUTSIDE_HOME: '{0} is imported in {1}, outside its home: {2}',
  Rule.EFFECT_OUTSIDE_EDGE: '{0} holds no effect, and {1} is one; it reaches it through a port',
  Rule.ENVIRONMENT_OUTSIDE_ROOT: '{0} reads the environment through {1}; only the root reads it',
}


def render(finding: Finding) -> str:
  return f'{finding.path}:{finding.line}: {MESSAGES[finding.rule].format(*finding.values)}'


def exit_status(findings: tuple[Finding, ...]) -> ExitStatus:
  return ExitStatus.FAILED if findings else ExitStatus.PASSED
