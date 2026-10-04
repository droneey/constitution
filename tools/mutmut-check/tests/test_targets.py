import pytest
from changes_fixtures import changes_of, python
from mutmut_check.targets import Changes, mutant_globs

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
      changes_of(lines={'README.md': (range(1, 2),)}),
      (),
      id='a file outside src/',
    ),
    pytest.param(changes_of(untracked=('src/shop/orders.py',)), ORDERS_ALL, id='a new file'),
    pytest.param(
      changes_of(untracked=('tests/test_orders.py',), extra={'tests/test_orders.py': ''}),
      ORDERS_ALL,
      id='a new spec named after a module',
    ),
    pytest.param(
      changes_of(
        lines={'README.md': (range(1, 2),), 'tests/kernel/test_money.py': (range(1, 2),)},
        extra={'tests/kernel/test_money.py': ''},
      ),
      ('shop.kernel.money.x_cents__mutmut_*',),
      id='a changed spec named after a module',
    ),
    pytest.param(
      changes_of(
        lines={'tests/test_basket.py': (range(1, 2),)},
        extra={
          'tests/test_basket.py': python(
            'from shop.orders import Basket', 'import shop.kernel.money', 'from . import x'
          )
        },
      ),
      ('shop.kernel.money.x_cents__mutmut_*', *ORDERS_ALL),
      id='a changed spec that imports modules',
    ),
    pytest.param(
      changes_of(
        lines={'tests/orders_fixtures.py': (range(1, 2),), 'docs/test_orders.py': (range(1, 2),)},
      ),
      (),
      id='a changed helper of the specs',
    ),
  ],
)
def test_should_mutate_the_functions_a_change_touches(
  changes: Changes, globs: tuple[str, ...]
) -> None:
  # Arrange
  touched = changes

  # Act
  targets = mutant_globs(touched)

  # Assert
  assert targets == globs
