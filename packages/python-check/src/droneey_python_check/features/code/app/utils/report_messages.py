from typing import Final

LIST_SEPARATOR: Final = ', '
PACKAGE_ROOT_LABEL: Final = 'the package root'

UNPARSABLE: Final = 'the file does not parse: {parser_message}'
LONG_FILE: Final = 'the file holds {line_count} lines, more than {limit}'
LONG_FUNCTION: Final = '{function_name} holds {line_count} lines, more than {limit}'
IMPORT_CLIMBING_OUT: Final = 'a relative import climbs out of the import package'
IMPORT_LEAVING_MODULE: Final = (
  'a relative import leaves its module, {module}; import it by its absolute path'
)
IMPORT_OF_ITSELF: Final = (
  'a module imports itself by its absolute path, {imported_name}; import it relatively'
)
PACKAGE_IN_PURE: Final = '{folder} imports no package, and {package_name} is one'
PACKAGE_WITHOUT_HOME: Final = (
  '{package_name} has no home in {folder}; a package without one is imported at the edge'
)
PACKAGE_OUTSIDE_HOME: Final = '{package_name} is imported in {folder}, outside its home: {home}'
EFFECT_OUTSIDE_EDGE: Final = (
  '{folder} holds no effect, and {effect_name} is one; it reaches it through a port'
)
ENVIRONMENT_OUTSIDE_ROOT: Final = (
  '{folder} reads the environment through {environment_name}; only the root reads it'
)

ERROR_LINE: Final = '{program}: {message}\n'
USAGE_LINE: Final = 'usage: {program} <path>...\n'
NO_PATH: Final = 'no path given'
MISSING_PATHS: Final = 'neither a file nor a folder: {paths}'
TABLE: Final = 'a table'
LIST_OF_TEXT: Final = 'a list of text'
WRONG_SHAPE: Final = '{path_from_unit}: {dotted_key} is not {expected}'
UNKNOWN_KEY: Final = '{path_from_unit}: {dotted_key} is no key the check reads; remove it'
MISSING_PART: Final = '{path_from_unit}, which extend names, does not exist'
MALFORMED_FILE: Final = '{path_from_unit}: the file does not parse as TOML: {parser_message}'
OWN_ERROR: Final = 'the check stopped on an error of its own, {error!r}; report it'
