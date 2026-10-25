from typing import TYPE_CHECKING

import pytest
from changes_fixtures import changes_of

from droneey_mutation_check.features.mutation.domain.use_cases.queries.check_mutants.steps import (
  find_targets,
)

if TYPE_CHECKING:
  from droneey_mutation_check.features.mutation.domain.entities import Changes

ORDERS_ALL = (
  'shop.orders.x_discount__mutmut_*',
  'shop.orders.x_total__mutmut_*',
  'shop.orders.xǁBasketǁadd__mutmut_*',
)


@pytest.mark.parametrize(
  ('changes', 'globs'),
  [
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(5, 6),)}),
      ('shop.orders.x_total__mutmut_*',),
      id='a line in a function',
    ),
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(4, 5),)}),
      ('shop.orders.x_total__mutmut_*',),
      id="a function's first line",
    ),
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(6, 8),)}),
      (),
      id='the lines between two functions',
    ),
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(8, 9),)}),
      ('shop.orders.x_discount__mutmut_*',),
      id="a function's decorator",
    ),
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(17, 18),)}),
      ('shop.orders.xǁBasketǁadd__mutmut_*',),
      id='a line in a method',
    ),
    pytest.param(
      changes_of(lines={'src/shop/orders.py': (range(14, 15),)}),
      (),
      id='a field of a class',
    ),
    pytest.param(
      changes_of(lines={'src/shop/__init__.py': (range(2, 3),)}),
      ('shop.x_version__mutmut_*',),
      id="a line of a package's surface",
    ),
    pytest.param(
      changes_of(lines={'src/shop/kernel/__init__.py': (range(2, 3),)}),
      ('shop.kernel.x_zero__mutmut_*',),
      id="a line of a folder's surface",
    ),
    pytest.param(
      changes_of(
        lines={'README.md': (range(1, 2),), 'tests/test_orders.py': (range(1, 2),)},
        untracked=('tests/test_basket.py',),
      ),
      (),
      id='specs and a file outside src/',
    ),
    pytest.param(changes_of(untracked=('src/shop/orders.py',)), ORDERS_ALL, id='a new file'),
  ],
)
def test_should_mutate_the_functions_a_change_touches(
  changes: Changes, globs: tuple[str, ...]
) -> None:
  # Arrange
  touched = changes

  # Act
  targets = find_targets(touched)

  # Assert
  assert targets == globs
