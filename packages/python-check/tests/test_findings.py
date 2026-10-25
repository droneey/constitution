from pathlib import Path

import pytest

from droneey_python_check.findings import Finding, Rule, render

ORDERS = Path('src/shop/orders.py')


# The one table of the findings' wording: each rule's line is pinned here alone.
@pytest.mark.parametrize(
  ('rule', 'values', 'line'),
  [
    pytest.param(Rule.SYNTAX, ('invalid syntax',), 'the file does not parse: invalid syntax'),
    pytest.param(Rule.FILE_LINES, ('501', '500'), 'the file holds 501 lines, more than 500'),
    pytest.param(
      Rule.FUNCTION_LINES, ('tally', '101', '100'), 'tally holds 101 lines, more than 100'
    ),
    pytest.param(Rule.IMPORT_CLIMBS_OUT, (), 'a relative import climbs out of the import package'),
    pytest.param(
      Rule.IMPORT_LEAVES_MODULE,
      ('kernel',),
      'a relative import leaves its module, kernel; import it by its absolute path',
    ),
    pytest.param(
      Rule.IMPORT_OF_ITSELF,
      ('shop.kernel',),
      'a module imports itself by its absolute path, shop.kernel; import it relatively',
    ),
    pytest.param(
      Rule.PACKAGE_IN_PURE, ('kernel', 'attrs'), 'kernel imports no package, and attrs is one'
    ),
    pytest.param(
      Rule.PACKAGE_WITHOUT_HOME,
      ('httpx', 'utils'),
      'httpx has no home in utils; a package without one is imported at the edge',
    ),
    pytest.param(
      Rule.PACKAGE_OUTSIDE_HOME,
      ('fastapi', 'api', 'edge, app'),
      'fastapi is imported in api, outside its home: edge, app',
    ),
    pytest.param(
      Rule.EFFECT_OUTSIDE_EDGE,
      ('kernel', 'time'),
      'kernel holds no effect, and time is one; it reaches it through a port',
    ),
    pytest.param(
      Rule.ENVIRONMENT_OUTSIDE_ROOT,
      ('adapters/mail', 'os.environ'),
      'adapters/mail reads the environment through os.environ; only the root reads it',
    ),
  ],
)
def test_should_render_a_finding_as_its_path_line_and_message(
  rule: Rule, values: tuple[str, ...], line: str
) -> None:
  # Arrange
  finding = Finding(path=ORDERS, line=3, rule=rule, values=values)

  # Act
  rendered = render(finding)

  # Assert
  assert rendered == f'src/shop/orders.py:3: {line}'
